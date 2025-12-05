import requests
from .config import GEMINI_API_KEY

def gemini_test():
    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateText?key=" + GEMINI_API_KEY
    data = {"prompt": {"text": "Backend Boot Successful"}}
    try:
        r = requests.post(url, json=data)
        return r.json()
    except:
        return {}
