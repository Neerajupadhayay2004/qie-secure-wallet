def score_transaction(data):
    score = 0.1
    if data.get("amount", 0) > 1000: score += 0.3
    if data.get("is_new_address"): score += 0.3
    return min(score, 1.0)
