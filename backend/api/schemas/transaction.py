from pydantic import BaseModel

class TransferRequest(BaseModel):
    from_address: str
    to_address: str
    amount: float
    token_symbol: str

class GasEstimateResponse(BaseModel):
    gas: int
    gas_price: int
    total_fee: int
