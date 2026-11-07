from fastapi import APIRouter

from app.schemas import HealthResponse

router = APIRouter(prefix="/api/v1", tags=["Health"])


@router.get("/health", response_model=HealthResponse)
def health():
    return {"status": "ok", "service": "api"}
