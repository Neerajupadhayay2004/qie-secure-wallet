from pydantic import BaseModel

class WalletCreate(BaseModel):
    fiat_currency: str
