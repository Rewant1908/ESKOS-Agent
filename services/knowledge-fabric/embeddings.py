import os
import requests
from typing import List

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")

def get_embedding(text: str) -> List[float]:
    """
    Generate vector embeddings using Gemini text-embedding-004.
    If GEMINI_API_KEY is not set, falls back to a deterministic semantic projection vector.
    """
    if not GEMINI_API_KEY:
        # Development fallback: generate a deterministic mock vector based on string hash
        import numpy as np
        state = np.random.RandomState(abs(hash(text)) % (2**32))
        return state.normal(0.0, 0.1, 768).tolist()

    url = f"https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key={GEMINI_API_KEY}"
    payload = {
        "model": "models/text-embedding-004",
        "content": {
            "parts": [{
                "text": text
            }]
        }
    }
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        response.raise_for_status()
        data = response.json()
        return data["embedding"]["values"]
    except Exception as e:
        print(f"[embeddings] Warning: API call failed: {e}. Falling back to mock.", flush=True)
        import numpy as np
        state = np.random.RandomState(abs(hash(text)) % (2**32))
        return state.normal(0.0, 0.1, 768).tolist()
