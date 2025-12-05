from fastapi import APIRouter
from ..core.notify import telegram_notify

router = APIRouter(prefix="/wallet")

# 3️⃣ SEND Notification
@router.post("/send")
def send(amount: float, to_address: str):
    telegram_notify(f"💸 SEND\nAmount: {amount}\nTo: {to_address}")
    return {"status": "sent", "amount": amount, "to": to_address}

# 4️⃣ RECEIVE Notification
@router.post("/receive")
def receive(amount: float, from_address: str):
    telegram_notify(f"📥 RECEIVE\nAmount: {amount}\nFrom: {from_address}")
    return {"status": "received", "amount": amount, "from": from_address}
