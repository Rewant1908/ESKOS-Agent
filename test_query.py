import requests

url = "https://riddance-shifting-defense.ngrok-free.dev/api/v1/knowledge/context"
payload = {
    "query": "I need some lab equipment that is highly resistant to thermal shock for my solvent recovery systems.",
    "org_id": "goel-scientific",
    "rag_type": "product",
    "limit": 3
}

headers = {
    "ngrok-skip-browser-warning": "true"
}

print(f"Sending POST request to: {url}")
response = requests.post(url, json=payload, headers=headers)

if response.status_code == 200:
    print(response.json().get("formatted_context", response.text))
else:
    print(f"Error {response.status_code}: {response.text}")
