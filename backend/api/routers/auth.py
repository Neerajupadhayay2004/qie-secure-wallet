from fastapi import APIRouter

router = APIRouter(prefix="/auth")

@router.get("/test")
def test_auth():
    return {"status": "auth ok"}
