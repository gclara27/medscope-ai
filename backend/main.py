"""MedScope AI — FastAPI application entry point."""

from fastapi import FastAPI

app = FastAPI(
    title="MedScope AI",
    description="Clinical Decision Support System API",
    version="0.1.0",
)


@app.get("/health")
def health_check() -> dict[str, str]:
    """Health check for Docker and load balancers."""
    return {"status": "ok"}
