from fastapi import APIRouter, Depends
from pydantic import BaseModel
from ..core.db import get_db

router = APIRouter()

class ChatMessage(BaseModel):
    escrow_id: str
    sender: str
    message: str

@router.post("/send")
def send(payload: ChatMessage, db=Depends(get_db)):
    db.messages.insert_one(payload.dict())
    return {"status": "ok"}
