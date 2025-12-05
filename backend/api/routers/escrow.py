from fastapi import APIRouter, Depends
from pydantic import BaseModel
from ..core.db import get_db

router = APIRouter()

class EscrowCreate(BaseModel):
    client_address: str
    freelancer_address: str
    amount: float
    token_symbol: str

@router.post("/create")
def create(payload: EscrowCreate, db=Depends(get_db)):
    doc = payload.dict()
    doc["status"] = "pending"
    id = db.escrows.insert_one(doc).inserted_id
    return {"escrow_id": str(id), "status": "pending"}
