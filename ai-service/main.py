"""
ThinkKraft AI service - Phase 0 skeleton.

For now this only proves the service runs and can reach Ollama.
The real pipeline (parse, check, hint ladder, guardrail, model adapter) arrives in Phase 3.

Run:  uvicorn main:app --reload --port 8000
"""

import httpx
from fastapi import FastAPI
from fastapi import UploadFile, File
from sb3_parser import parse_sb3

app = FastAPI(title="ThinkKraft AI service")

OLLAMA_URL = "http://localhost:11434"


@app.get("/health")
def health():
    # A plain liveness check. The Next.js core calls this to confirm the AI service is up.
    return {"status": "ok", "service": "ai"}


@app.get("/ollama-check")
async def ollama_check():
    # Confirms the model runtime is reachable and lists any models you have pulled.
    # This is the seam that, in Phase 3, becomes the model adapter.
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            res = await client.get(f"{OLLAMA_URL}/api/tags")
            res.raise_for_status()
            models = [m["name"] for m in res.json().get("models", [])]
        return {"status": "ok", "ollama": "reachable", "models": models}
    except Exception as exc:
        return {"status": "error", "ollama": "unreachable", "detail": str(exc)}


@app.post("/parse")
async def parse(file: UploadFile = File(...)):
    data = await file.read()
    try:
        return parse_sb3(data)
    except Exception as e:
        return {"error": str(e)}
