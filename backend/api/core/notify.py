import requests
from .config import TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID

def telegram_notify(message: str):
    print("BOT:", TELEGRAM_BOT_TOKEN)
    print("CHAT:", TELEGRAM_CHAT_ID)

    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        print("❌ Telegram config missing in .env!")
        return

    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {"chat_id": TELEGRAM_CHAT_ID, "text": message}

    try:
        r = requests.post(url, json=payload)
        print("Telegram API Response:", r.text)
    except Exception as e:
        print("❌ Telegram Send Error:", e)
