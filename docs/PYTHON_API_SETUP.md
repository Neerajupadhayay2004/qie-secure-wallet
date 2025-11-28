# Python API Setup Guide

This guide explains how to set up your external Python API for the QIE Wallet.

## Option 1: AWS Lambda

### Step 1: Create Lambda Function

```python
# lambda_function.py
import json
import numpy as np
from sklearn.ensemble import IsolationForest
from datetime import datetime

def lambda_handler(event, context):
    """Main Lambda handler that routes requests"""
    
    path = event.get('path', '').strip('/')
    body = json.loads(event.get('body', '{}'))
    
    routes = {
        'analyze_wallet': analyze_wallet,
        'predict_fraud': predict_fraud,
        'ml_scoring': ml_scoring,
        'pattern_analysis': pattern_analysis,
    }
    
    handler = routes.get(path, unknown_route)
    result = handler(body)
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(result)
    }

def analyze_wallet(data):
    """Analyze wallet for risks and patterns"""
    wallet_address = data.get('wallet_address')
    transactions = data.get('transactions', [])
    
    # Calculate risk metrics
    amounts = [t.get('amount', 0) for t in transactions]
    
    risk_score = calculate_risk_score(amounts, transactions)
    patterns = detect_patterns(transactions)
    anomalies = detect_anomalies(amounts)
    
    return {
        'risk_score': risk_score,
        'transaction_patterns': patterns,
        'recommendations': generate_recommendations(risk_score, patterns),
        'anomalies': anomalies
    }

def predict_fraud(data):
    """ML-based fraud prediction"""
    amount = data.get('amount', 0)
    token = data.get('token', '')
    historical = data.get('historical_data', [])
    
    # Simple fraud detection logic (replace with your ML model)
    features = extract_features(data)
    
    # Isolation Forest for anomaly detection
    if len(historical) > 10:
        amounts = [h.get('amount', 0) for h in historical]
        model = IsolationForest(contamination=0.1, random_state=42)
        model.fit(np.array(amounts).reshape(-1, 1))
        prediction = model.predict([[amount]])[0]
        is_fraud = prediction == -1
        confidence = 0.85 if is_fraud else 0.95
    else:
        is_fraud = amount > 10000  # Simple threshold
        confidence = 0.6
    
    risk_factors = []
    if amount > 5000:
        risk_factors.append("High transaction amount")
    if data.get('is_new_address', False):
        risk_factors.append("New recipient address")
    
    return {
        'is_fraud': is_fraud,
        'confidence': confidence,
        'risk_factors': risk_factors,
        'ml_model_version': '1.0.0'
    }

def ml_scoring(data):
    """Generate ML-based scores for wallet"""
    wallet_address = data.get('wallet_address')
    
    # Placeholder scoring logic
    return {
        'credit_score': 750,
        'trust_score': 85,
        'activity_score': 92,
        'overall_rating': 'A'
    }

def pattern_analysis(data):
    """Analyze transaction patterns"""
    transactions = data.get('transactions', [])
    
    patterns = []
    insights = []
    predictions = []
    
    if transactions:
        # Time-based patterns
        patterns.append({
            'type': 'temporal',
            'frequency': len(transactions),
            'description': 'Regular transaction activity detected'
        })
        
        # Amount patterns
        amounts = [t.get('amount', 0) for t in transactions]
        avg_amount = sum(amounts) / len(amounts) if amounts else 0
        
        patterns.append({
            'type': 'amount',
            'frequency': len([a for a in amounts if a > avg_amount]),
            'description': f'Average transaction: {avg_amount:.2f}'
        })
        
        insights.append(f"Total transactions analyzed: {len(transactions)}")
        predictions.append("Expected continued activity based on patterns")
    
    return {
        'patterns': patterns,
        'insights': insights,
        'predictions': predictions
    }

def calculate_risk_score(amounts, transactions):
    """Calculate overall risk score 0-100"""
    if not amounts:
        return 0
    
    score = 50  # Base score
    
    # High amount transactions increase risk
    avg = sum(amounts) / len(amounts)
    if avg > 1000:
        score += 20
    
    # Many transactions can be risky
    if len(transactions) > 50:
        score += 15
    
    return min(score, 100)

def detect_patterns(transactions):
    """Detect transaction patterns"""
    patterns = []
    if len(transactions) > 10:
        patterns.append("Regular trading activity")
    if any(t.get('type') == 'swap' for t in transactions):
        patterns.append("Token swapping behavior")
    return patterns

def detect_anomalies(amounts):
    """Detect anomalous amounts"""
    if not amounts or len(amounts) < 5:
        return []
    
    mean = sum(amounts) / len(amounts)
    std = (sum((x - mean) ** 2 for x in amounts) / len(amounts)) ** 0.5
    
    anomalies = []
    for i, amount in enumerate(amounts):
        if abs(amount - mean) > 2 * std:
            anomalies.append({
                'index': i,
                'amount': amount,
                'deviation': abs(amount - mean) / std if std > 0 else 0
            })
    
    return anomalies

def extract_features(data):
    """Extract features for ML model"""
    return {
        'amount': data.get('amount', 0),
        'hour': datetime.now().hour,
        'is_new_address': data.get('is_new_address', False)
    }

def generate_recommendations(risk_score, patterns):
    """Generate security recommendations"""
    recs = []
    if risk_score > 70:
        recs.append("Enable 2FA for all transactions")
        recs.append("Review recent transaction history")
    if "Token swapping behavior" in patterns:
        recs.append("Monitor swap rates for best deals")
    return recs

def unknown_route(data):
    return {'error': 'Unknown endpoint'}
```

### Step 2: Deploy to AWS Lambda

1. Create a new Lambda function in AWS Console
2. Use Python 3.9+ runtime
3. Add layers for numpy and scikit-learn (or use Lambda Docker)
4. Create an API Gateway trigger
5. Copy the API Gateway URL

### Step 3: Add Secrets to Lovable

After deploying, add these secrets in Lovable:
- `PYTHON_API_URL`: Your API Gateway URL (e.g., `https://xxx.execute-api.us-east-1.amazonaws.com/prod`)
- `PYTHON_API_KEY`: Optional API key for authentication

---

## Option 2: Google Cloud Functions

### Step 1: Create Cloud Function

```python
# main.py
import functions_framework
from flask import jsonify
import json

@functions_framework.http
def main(request):
    """HTTP Cloud Function entry point"""
    
    # Handle CORS
    if request.method == 'OPTIONS':
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
            'Access-Control-Max-Age': '3600'
        }
        return ('', 204, headers)
    
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
    }
    
    path = request.path.strip('/')
    data = request.get_json(silent=True) or {}
    
    routes = {
        'analyze_wallet': analyze_wallet,
        'predict_fraud': predict_fraud,
        'ml_scoring': ml_scoring,
        'pattern_analysis': pattern_analysis,
    }
    
    handler = routes.get(path, unknown_route)
    result = handler(data)
    
    return (jsonify(result), 200, headers)

# ... (same functions as Lambda above)
```

### Step 2: Deploy

```bash
gcloud functions deploy qie-wallet-api \
  --runtime python39 \
  --trigger-http \
  --allow-unauthenticated \
  --entry-point main
```

### Step 3: Add Secrets

Add your Cloud Function URL to Lovable secrets:
- `PYTHON_API_URL`: `https://REGION-PROJECT.cloudfunctions.net/qie-wallet-api`

---

## Testing Your API

Once deployed, test with:

```bash
curl -X POST https://your-api-url/predict_fraud \
  -H "Content-Type: application/json" \
  -d '{"amount": 1000, "token": "USDT", "recipient": "0x123..."}'
```

## Requirements

For AWS Lambda or GCP, include these in `requirements.txt`:

```
numpy>=1.21.0
scikit-learn>=1.0.0
```
