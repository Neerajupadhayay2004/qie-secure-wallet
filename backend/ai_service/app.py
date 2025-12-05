from flask import Flask, request, jsonify
from fraud_model import score_transaction

app = Flask(__name__)

@app.post("/score")
def score():
    return jsonify({"score": score_transaction(request.json)})

if __name__ == "__main__":
    app.run(port=8001)
