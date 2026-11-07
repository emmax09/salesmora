# Salesmora

Salesmora is a multi-tenant platform for customer conversations, sales execution, and connected business workflows. The repository has two independent application workspaces: `frontend/` and `backend/`.

## Repository architecture

```text
frontend/                    Next.js application and frontend-owned packages
  packages/ui/                Approved design-system primitives
  packages/api-client/        Typed client generated from pinned OpenAPI v1
backend/                     Python API and background-processing workspace
  app/                        FastAPI routes, domain logic, SQLAlchemy models
  worker/                     Independent Celery app, tasks, and Dockerfile
  migrations/                 Alembic revisions and retained SQL migration assets
  infrastructure/docker/      Local PostgreSQL, Redis, and Mailpit services
docs/                         Architecture decisions and design system
scripts/                      Repository boundary and source-size checks
.github/                      Independent frontend and backend CI jobs
```

There is no root application workspace, lockfile, `packages/`, `node_modules/`, or environment file. Frontend owns its pnpm workspace. Backend is Python-only and owns `pyproject.toml` plus pinned requirements. Read [AGENTS.md](./AGENTS.md) before changes and use [docs/design/DESIGN_SYSTEM.md](./docs/design/DESIGN_SYSTEM.md) for frontend design rules.

## Technology

- Web: Next.js, React, TypeScript, Tailwind CSS.
- API: Python 3.11, FastAPI, Pydantic, SQLAlchemy 2.0, PostgreSQL, and Alembic.
- Background tasks: Celery worker using Redis as broker and result backend.
- API contract: FastAPI OpenAPI v1 exported to `backend/openapi/v1.json`; the frontend generates its client from a pinned copy and builds without a running API.

## Install and configure

Install the frontend independently:

```powershell
pnpm --dir frontend install
```

Create and install the Python environment from the repository root:

```powershell
py -3.11 -m venv backend/.venv
backend\.venv\Scripts\python.exe -m pip install -r backend\requirements-dev.lock -e backend
```

Frontend settings belong in `frontend/.env.local` (copy `frontend/.env.example`). API and worker settings belong in `backend/.env` (copy `backend/.env.example` if needed). The backend needs `DATABASE_URL`, `REDIS_URL`, and a private `APP_SECRET_KEY` of at least 32 characters. Keep real environment files out of Git and Docker images.

The local web origin is `http://localhost:3000`; the API origin is `http://localhost:3001`. Local email uses Mailpit on SMTP port 1025 and its inbox UI on port 8025.

## Start local services and apps

Run from the repository root. If PostgreSQL is already running locally on port 5432, start just Redis and Mailpit from Docker:

```powershell
docker compose --env-file backend/.env -f backend/infrastructure/docker/compose.yaml up -d redis mailpit
```

If you want Compose to run PostgreSQL too, ensure port 5432 is available and that `DATABASE_URL` uses the same PostgreSQL credentials and port.

Apply migrations and start the API from one terminal:

```powershell
Set-Location backend
.\.venv\Scripts\python.exe -m alembic upgrade head
.\.venv\Scripts\uvicorn.exe app.main:app --reload --port 3001
```

Start the Celery worker from another terminal. On Windows, use the `solo` pool for local development:

```powershell
Set-Location backend
.\.venv\Scripts\celery.exe -A worker.celery_app:celery_app worker --loglevel=INFO --pool=solo
```

Start the frontend from a third terminal:

```powershell
pnpm --dir frontend dev
```

- Web app: <http://localhost:3000>
- API health: <http://localhost:3001/api/v1/health>
- Interactive API docs: <http://localhost:3001/docs>
- OpenAPI JSON: <http://localhost:3001/api/v1/openapi.json>
- Mailpit inbox: <http://localhost:8025>

## Try account setup

1. Open <http://localhost:3000/auth/register>, enter a name, email, and password of at least 12 characters.
2. Open Mailpit and use the verification link.
3. Continue to onboarding and enter the business name, industry, country, time zone, and default currency.
4. Open the workspace. Organization settings, team settings, account settings, and audit history are available from Settings.
5. Invite an email address you can access from Team settings. Open its Mailpit message and accept the invite after signing in or creating the matching account.

The worker sends verification, recovery, and invitation messages. SMTP acceptance means the configured SMTP server accepted the message; it does not confirm delivery to a real mailbox.

## Authentication and organization access

FastAPI owns email/password registration, email verification, password recovery, cookie sessions, and identity endpoints. Passwords must be 12–128 characters. Scrypt hashes use the existing Phase 1 format so migrated credentials remain usable. Session cookies are HttpOnly, SameSite=Lax, and Secure in production; PostgreSQL stores a keyed hash of the opaque session token. Sessions expire after seven days, and password recovery revokes existing sessions.

The API rate-limits authentication and public-form requests through Redis, requires the configured `WEB_ORIGIN` on browser writes, and allows credentialed CORS only for that exact origin. Do not use wildcard origins in a deployed environment.

| Role | Organization settings | Team actions | Audit log | Ownership transfer |
| --- | --- | --- | --- | --- |
| Owner | Read and update | Invite, manage eligible members and invitations | Read | Yes |
| Admin | Read and update | Invite and manage lower roles | Read | No |
| Manager | Read | Invite and manage members/viewers | No | No |
| Member | Read | Read members | No | No |
| Viewer | Read | Read members | No | No |

Every sensitive action is authorized on the server and scoped to the caller's active organization. Organization IDs and slugs are not authorization boundaries.

## Routes and versioned API contract

- Public website: `/`, `/product`, `/features`, `/how-it-works`, `/demo`, `/about`, `/early-access`, `/contact`, `/privacy`, `/terms`.
- Authentication: `/auth/login`, `/auth/register`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/verify-email`.
- Onboarding and workspace: `/onboarding`, `/workspace`, `/workspace/settings`, `/workspace/team`, `/workspace/audit`, `/workspace/account`.
- API authentication: `/api/v1/auth/*`.
- Identity, organizations, members, invitations, audit events, and public forms are documented in OpenAPI v1.

To update the API contract, export the backend spec, sync the frontend snapshot, and regenerate TypeScript:

```powershell
Set-Location backend
.\.venv\Scripts\python.exe scripts/export_openapi.py
Set-Location ..
pnpm --dir frontend run sync:api
pnpm --dir frontend run generate:api
Set-Location backend
.\.venv\Scripts\python.exe scripts/check_contract.py
```

The frontend's pinned contract means its install and build do not require a running FastAPI server.

## Database migrations and quality checks

Versioned Alembic revisions live in `backend/migrations/versions/`; preserved SQL history lives in `backend/migrations/sql/legacy_prisma/`. The first Alembic revision checks for a complete existing schema and records a baseline without replaying data-altering SQL. On an empty database it applies the retained SQL migrations in order. New changes should be added as Alembic revisions.

```powershell
Set-Location backend
.\.venv\Scripts\python.exe -m alembic upgrade head
.\.venv\Scripts\python.exe -m alembic current
.\.venv\Scripts\python.exe -m pytest
.\.venv\Scripts\ruff.exe check app worker migrations scripts tests
.\.venv\Scripts\ruff.exe format --check app worker migrations scripts tests
.\.venv\Scripts\python.exe scripts/export_openapi.py --check
.\.venv\Scripts\python.exe scripts/check_contract.py
```

Frontend checks:

```powershell
pnpm --dir frontend run format:check
pnpm --dir frontend lint
pnpm --dir frontend run typecheck
pnpm --dir frontend test
pnpm --dir frontend build
```

Repository checks:

```powershell
node scripts/check-package-boundaries.mjs
node scripts/check-source-line-limits.mjs
```

## Independent deployment targets

Build the three deployable images from separate Dockerfiles:

```powershell
docker build -t salesmora-frontend frontend
docker build -t salesmora-api -f backend/Dockerfile backend
docker build -t salesmora-worker -f backend/worker/Dockerfile backend
```

The frontend image contains only the Next.js app and frontend packages. The API and worker are separate Python images with shared backend code but separate entry points and runtime environment. An API release does not require rebuilding the frontend, and a worker release can be deployed independently while remaining compatible with backend queue and schema versions.

## Current scope and limitations

The current product includes email/password authentication, identity, organizations, authorization, invitations, organization settings, audit history, and public marketing, contact, and early-access pages. Inbox, customer records, sales workflows, payments, Guardian, and AI agents are not implemented. Primary navigation areas that are not available yet are labeled accordingly; no operational metrics are fabricated.

Production SMTP and domain settings are not configured. SMTP acceptance does not confirm delivery, and delivery webhooks or bounce processing are not implemented. Business queue processors beyond transactional email are outside the current scope.

## Architecture decisions

- [ADR 0001: Prisma PostgreSQL driver adapter (historical)](./docs/architecture/0001-prisma-postgresql-driver-adapter.md)
- [ADR 0002: Identity foundation (historical)](./docs/architecture/0002-identity-foundation.md)
- [ADR 0003: Better Auth and organization authorization (superseded)](./docs/architecture/0003-better-auth-and-organization-authorization.md)
- [ADR 0004: Independent frontend and backend workspaces](./docs/architecture/0004-independent-frontend-backend-workspaces.md)
- [ADR 0005: Python backend and Celery worker](./docs/architecture/0005-python-backend-and-celery-worker.md)
