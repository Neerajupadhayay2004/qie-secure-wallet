from fastapi import APIRouter
from ..schemas.transaction import TransferRequest, GasEstimateResponse
from ..core.blockchain import estimate_gas_fee, web3

router = APIRouter()

@router.post("/estimate", response_model=GasEstimateResponse)
def estimate(payload: TransferRequest):
    amt = web3.to_wei(payload.amount, "ether")
    return GasEstimateResponse(**estimate_gas_fee(payload.from_address, payload.to_address, amt))

@router.post("/send")
def send_tx(payload: TransferRequest):
    return {
        "status": "pending",
        "message": "Implement real signing later",
        "payload": payload.dict()
    }
