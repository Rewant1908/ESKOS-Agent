import threading

from app import api, main


if __name__ == "__main__":
    threading.Thread(target=main, daemon=True).start()
    api.run(host="0.0.0.0", port=8000)
