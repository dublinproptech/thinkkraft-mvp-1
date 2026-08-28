# ThinkKraft prototype

Two runnable pieces plus a database:

- `web/` : the Next.js app (frontend and core)
- `ai-service/` : the Python AI service
- Postgres runs in Docker; Ollama runs natively on your Mac.

## Prerequisites (Mac M1)

- Node.js 20+ (`brew install node` or use nvm)
- Python 3.11+ (`brew install python@3.11`)
- Docker Desktop
- Ollama (`brew install ollama`), then pull a model: `ollama pull llama3.2`

## One-time setup

1. Start the database:
   ```
   docker compose up -d
   ```
2. Web app:
   ```
   cd web
   npm install
   cp .env.example .env.local
   npx prisma generate
   ```
3. AI service:
   ```
   cd ai-service
   python3 -m venv .venv && source .venv/bin/activate
   pip install -r requirements.txt
   ```

## Run it (three terminals)

- Ollama: `ollama serve` (or just run `ollama run llama3.2` once)
- AI service: `cd ai-service && source .venv/bin/activate && uvicorn main:app --reload --port 8000`
- Web app: `cd web && npm run dev`

Open http://localhost:3000 . All three status rows should be green.

## Verify the seams directly

- Web to DB: http://localhost:3000/api/health
- Web to AI: http://localhost:3000/api/ai-check
- AI to Ollama: http://localhost:8000/ollama-check
