"""Request timing middleware for API profiling (T-703, RNF-001, RNF-002)."""

from __future__ import annotations

import time

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

PROCESS_TIME_HEADER = "X-Process-Time-Ms"


class PerformanceMiddleware(BaseHTTPMiddleware):
    """Attach server-side processing time (ms) to every API response."""

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        started = time.perf_counter()
        response = await call_next(request)
        elapsed_ms = (time.perf_counter() - started) * 1000.0
        response.headers[PROCESS_TIME_HEADER] = f"{elapsed_ms:.2f}"
        return response
