"""MedScope AI — FastAPI application entry point."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import settings
from core.exception_handlers import register_exception_handlers
from core.ml_registry import ml_registry
from routers import analytics, auth, dashboard, history, predictions, simulations


@asynccontextmanager
async def lifespan(_app: FastAPI):
    """Load ML artifacts once at startup (T-301, UC-082)."""
    ml_registry.load()
    yield
    ml_registry.unload()


app = FastAPI(
    title="MedScope AI",
    description="Clinical Decision Support System API",
    version="0.1.0",
    lifespan=lifespan,
)

register_exception_handlers(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(predictions.router, tags=["predictions"])
app.include_router(simulations.router, tags=["simulations"])
app.include_router(history.router, tags=["history"])
app.include_router(dashboard.router, tags=["dashboard"])
app.include_router(analytics.router, tags=["analytics"])


@app.get("/health", tags=["system"])
def health_check() -> dict[str, str | bool]:
    """Health check for Docker, load balancers, and monitoring."""
    payload: dict[str, str | bool] = {
        "status": "ok",
        "service": "medscope-api",
        "ml_ready": ml_registry.is_ready,
    }
    if not ml_registry.is_ready and ml_registry.load_error:
        payload["ml_error"] = ml_registry.load_error
    return payload
