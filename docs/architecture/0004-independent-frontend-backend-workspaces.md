# ADR 0004: Independent frontend and backend workspaces

**Status:** Accepted and implemented  
**Date:** 2026-11-07

## Context

One root pnpm/Turborepo workspace coupled frontend and backend installs and deployments. The repository was separated into application domains, then the backend stack was changed to Python.

## Decision

- Keep `frontend/`, `backend/`, `infrastructure/` (only if a shared deployment concern requires it), `docs/`, `scripts/`, `.github/`, `README.md`, and `AGENTS.md` at the root. Current local service infrastructure is backend-owned at `backend/infrastructure/`.
- `frontend/` owns Next.js, React, TypeScript, Tailwind, design-system libraries, tests, pnpm configuration, lockfile, environment template, and its Docker deployment target.
- `backend/` owns Python dependencies, FastAPI, PostgreSQL access, SQLAlchemy models, Alembic migrations, Celery app, tests, environment template, and API/worker deployment configuration.
- `backend/worker/` runs as a separate Celery process with its own entry point and Dockerfile while importing shared backend logic from the Python workspace.
- Backend publishes the OpenAPI v1 document at `backend/openapi/v1.json`. Frontend pins it under `frontend/packages/api-client/openapi/` and checks in generated TypeScript types. Frontend builds use the pinned copy without a live API.
- Keep runtime environment in `frontend/.env.local` and `backend/.env`; omit actual environment files from Git and Docker contexts.
- CI and deployment configurations build the frontend, API, and worker independently.

## Directory mapping

| Previous path | Current path |
| --- | --- |
| `apps/web` | `frontend` |
| `apps/api` | `backend/app` |
| `apps/worker` | `backend/worker` |
| `packages/ui` | `frontend/packages/ui` |
| `packages/api-client` | `frontend/packages/api-client` |
| `packages/contracts` | Backend Pydantic models and OpenAPI |
| `packages/database` | `backend/app/db` and `backend/migrations` |
| `infrastructure` | `backend/infrastructure` |

## Consequences

Frontend releases can use their pinned API contract without rebuilding the backend. API and worker images are independently deployable; the worker and API share domain logic and schema compatibility but run as separate processes. No customer, CRM, AI, Guardian, or other future product domains are added by this architecture decision.
