import os
import json
import time
import requests
from pathlib import Path

KAFKA_BROKERS = os.environ.get("KAFKA_BROKERS", "localhost:9092")
FABRIC_API_URL = "http://localhost:8090/api/v1/knowledge/store"

def load_seed_data():
    seed_dir = Path(__file__).parent / "products"
    if not seed_dir.exists():
        print(f"[seed-loader] Error: {seed_dir} does not exist.")
        return

    print("[seed-loader] Starting seed data ingestion...")
    
    files = list(seed_dir.glob("*.json"))
    for file_path in files:
        with open(file_path, "r") as f:
            payload = json.load(f)
            
        print(f"[seed-loader] Reading document: {payload['doc_id']} ({payload['metadata']['product_name']})")
        
        # In a real environment, we'd write to the "raw-ingest" Kafka topic.
        # Here we also support direct REST call to knowledge-fabric as a smoke test validation.
        try:
            # Let's hit the HTTP endpoint directly to verify API parsing, schema extraction, Neo4j, Qdrant, and Postgres sync.
            response = requests.post(FABRIC_API_URL, json=payload, timeout=10)
            if response.status_code == 200:
                print(f"[seed-loader] Direct Ingestion success: {response.json()}")
            else:
                print(f"[seed-loader] Direct Ingestion failed with code {response.status_code}: {response.text}")
        except Exception as e:
            print(f"[seed-loader] Connection to Knowledge Fabric API failed: {e}. (Ensure service is running at :8090)")
            
if __name__ == "__main__":
    load_seed_data()
