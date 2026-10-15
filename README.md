# ThinkKraft MVP

An AI-assisted learning platform built with Next.js, a Python microservice powered by Google Gemini, Neon Serverless PostgreSQL, and containerized with Docker.

---

## Architecture Overview

* **Frontend & Web Core:** Next.js (App Router, TypeScript, Tailwind CSS)
* **AI Service:** Python (FastAPI / Gemini 2.5 Flash-Lite integration)
* **Database:** [Neon](https://neon.tech) Serverless PostgreSQL managed via Prisma ORM
* **Containerization:** Multi-container setup managed via `docker-compose.yml`
* **CI/CD & Deployment:** GitHub Actions pipeline configured for containerized deployment

---

## Environment Configuration

Create a `.env` file in the root directory (and inside your individual service folders if separated) containing the following keys:

```env
# Database (Neon Serverless PostgreSQL)
DATABASE_URL="postgresql://<user>:<password>@<neon-host>/<dbname>?sslmode=require"

# AI Service & LLM Configuration
GEMINI_API_KEY="your-google-gemini-api-key"
AI_SERVICE_URL="http://localhost:8000"

# Application Settings
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"