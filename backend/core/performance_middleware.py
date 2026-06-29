"""Request timing middleware for API profiling (T-703, RNF-001, RNF-002)."""

from __future__ import annotations

import logging
import time

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

PROCESS_TIME_HEADER = "X-Process-Time-Ms"
SLOW_REQUEST_MS = 1000.0

logger = logging.getLogger(__name__)


class PerformanceMiddleware(BaseHTTPMiddleware):
    """Attach server-side processing time (ms) to every API response."""

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        started = time.perf_counter()
        response = await call_next(request)
        elapsed_ms = (time.perf_counter() - started) * 1000.0
        response.headers[PROCESS_TIME_HEADER] = f"{elapsed_ms:.2f}"

        log_kwargs = {
            "http_method": request.method,
            "http_path": request.url.path,
            "status_code": response.status_code,
            "duration_ms": round(elapsed_ms, 2),
        }
        if elapsed_ms >= SLOW_REQUEST_MS:
            logger.warning("slow_request", extra=log_kwargs)
        else:
            logger.debug("http_request", extra=log_kwargs)

        return response
