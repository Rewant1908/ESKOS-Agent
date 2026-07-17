FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Download lightweight spacy model for entity extraction
RUN python -m spacy download en_core_web_sm

COPY . .

EXPOSE 8090

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8090"]
