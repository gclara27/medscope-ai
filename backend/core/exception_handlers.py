"""Global exception handlers — JSON errors without stack traces (T-311, UC-091, RNF-050)."""

from __future__ import annotations

import logging

from fastapi import FastAPI, HTTPException, Request
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from core.api_errors import INTERNAL_SERVER_ERROR

logger = logging.getLogger(__name__)


def _serialize_detail(detail: object) -> object:
    """Ensure HTTPException detail is JSON-safe (UC-091)."""
    return jsonable_encoder(detail)


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    if exc.status_code >= 500:
        logger.error("HTTP %s on %s %s", exc.status_code, request.method, request.url.path)
    elif exc.status_code >= 400:
        logger.warning(
            "HTTP %s on %s %s: %s",
            exc.status_code,
            request.method,
            request.url.path,
            exc.detail,
        )
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": _serialize_detail(exc.detail)},
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    logger.info(
        "validation_error",
        extra={
            "http_method": request.method,
            "http_path": request.url.path,
            "error_count": len(exc.errors()),
        },
    )
    return JSONResponse(
        status_code=422,
        content={"detail": jsonable_encoder(exc.errors())},
    )


async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Last-resort handler (ServerErrorMiddleware). Delegate known types, never leak traces."""
    if isinstance(exc, RequestValidationError):
        return await validation_exception_handler(request, exc)
    if isinstance(exc, HTTPException):
        return await http_exception_handler(request, exc)
    if isinstance(exc, StarletteHTTPException):
        return await http_exception_handler(request, exc)

    logger.exception("Unhandled exception on %s %s", request.method, request.url.path)
    return JSONResponse(status_code=500, content={"detail": INTERNAL_SERVER_ERROR})


def register_exception_handlers(app: FastAPI) -> None:
    """Register centralized handlers so clients never receive stack traces (UC-091).

    Starlette stores handlers in a type-keyed map and resolves via exception MRO, not
    registration order. The ``Exception`` handler is wired into ``ServerErrorMiddleware``
    for uncaught errors; specific types below are handled in ``ExceptionMiddleware``.
    """
    app.add_exception_handler(HTTPException, http_exception_handler)
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(Exception, unhandled_exception_handler)
