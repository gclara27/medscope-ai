"""MedScope AI — FastAPI application entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import settings
from routers import analytics, auth, history, predictions, simulations

app = FastAPI(
    title="MedScope AI",
    description="Clinical Decision Support System API",
    version="0.1.0",
)

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
app.include_router(analytics.router, tags=["analytics"])


@app.get("/health", tags=["system"])
def health_check() -> dict[str, str]:
    """Health check for Docker, load balancers, and monitoring."""
    return {"status": "ok", "service": "medscope-api"}
