from web3 import Web3
from .config import QIE_RPC_URL

web3 = Web3(Web3.HTTPProvider(QIE_RPC_URL))

def create_wallet():
    acc = web3.eth.account.create()
    return { "address": acc.address, "private_key": acc._private_key.hex() }
