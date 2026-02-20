"""CLARA backend - FastAPI app with WebSocket support."""
import json
import sys
from pathlib import Path

# Ensure backend directory is on path when run as script
_BACKEND_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(_BACKEND_DIR))

from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware

from config import HOST, PORT, FRONTEND_URL

app = FastAPI(title="CLARA Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:5173", "http://127.0.0.1:8000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"status": "ok", "service": "CLARA"}


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.websocket("/ws/clara")
async def websocket_clara(websocket: WebSocket):
    await websocket.accept()
    try:
        # FRONT-Clara-1 expects { state: number, payload?: any }
        await websocket.send_json({"state": 0, "payload": None})
        while True:
            data = await websocket.receive_text()
            try:
                msg = json.loads(data) if data else {}
                action = msg.get("action")
                if action == "wake":
                    await websocket.send_json({"state": 3, "payload": None})
                elif action == "language_selected":
                    await websocket.send_json({"state": 4, "payload": None})
                elif action == "menu_select":
                    id_ = msg.get("id")
                    await websocket.send_json({"state": 5 if id_ == "voice" else 4, "payload": msg})
                else:
                    await websocket.send_json({"state": 4, "payload": msg})
            except Exception:
                await websocket.send_json({"state": 0, "payload": None})
    except Exception as e:
        try:
            await websocket.send_json({"state": -1, "payload": {"error": str(e)}})
        except Exception:
            pass
    finally:
        try:
            await websocket.close()
        except Exception:
            pass


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=HOST, port=PORT)
