from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import time

from .routers import auth, wallet
from .core.notify import telegram_notify

app = FastAPI(
    title="QIE Secure Wallet API",
    description="AI + Blockchain Wallet Backend",
    version="1.0.0",
)

# Allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1️⃣ Backend START notification
@app.on_event("startup")
async def startup_event():
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(
        None,
        telegram_notify,
        "🚀 QIE Secure Wallet Backend Started Successfully!"
    )
    print("Backend booted successfully!")

# 2️⃣ Backend RELOAD notification
@app.on_event("startup")
async def reload_event():
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(
        None,
        telegram_notify,
        f"🔄 Backend Reloaded at {time.strftime('%H:%M:%S')}"
    )

# Load Routers
app.include_router(auth.router)
app.include_router(wallet.router)

@app.get("/")
def root():
    return {"status": "running", "message": "Backend Active 🚀"}
