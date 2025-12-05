from fastapi import APIRouter, HTTPException
import requests
from pydantic import BaseModel
from ..core.config import AI_SERVICE_URL

router = APIRouter()

class FraudCheck(BaseModel):
    from_address: str
    to_address: str
    amount: float
    is_new_address: bool = False
    country_mismatch: bool = False

@router.post("/check")
def check(payload: FraudCheck):
    try:
        res = requests.post(f"{AI_SERVICE_URL}/score_transaction", json=payload.dict())
        return res.json()
    except Exception as e:
        raise HTTPException(500, f"AI error: {e}")
