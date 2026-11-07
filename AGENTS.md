# Salesmora Engineering Instructions

Read this file before changing the repository. The architecture and quality rules here are the project contract.

## Repository layout and ownership

- The root contains `frontend/`, `backend/`, `docs/`, `scripts/`, `.github/`, `README.md`, and this file. Do not add a root app package, lockfile, `node_modules`, `.env`, or `packages/` directory.
- `frontend/` is an independent pnpm workspace for Next.js, React, TypeScript, Tailwind, and the approved design system in `docs/design/DESIGN_SYSTEM.md`. It owns its manifest, workspace file, lockfile, environment template, tests, build configuration, generated API client, and deployment pipeline.
- Frontend business UI belongs under `frontend/src/features/`. Keep public pages separate from authenticated application routes. Frontend libraries belong under `frontend/packages/` only when they provide real value.
- `backend/` is a Python workspace using FastAPI, PostgreSQL, SQLAlchemy 2.0, Alembic, Celery, and Redis. It owns `pyproject.toml`, the pinned `requirements.lock`, `.env.example`, tests, migrations, and deployment configuration. Do not introduce a Node backend toolchain.
- Keep domain HTTP routes under `backend/app/routes/`, persistence models under `backend/app/db/`, and shared backend logic in Python modules under `backend/app/`.
- The Celery runtime lives in `backend/worker/`. Keep its app and task entry points independently runnable and its Dockerfile separate from the API image. The API and worker may import the same backend-owned domain logic but run as separate processes.
- Local PostgreSQL, Redis, and Mailpit services live in `backend/infrastructure/docker/compose.yaml`.
- Backend publishes the versioned OpenAPI document at `backend/openapi/v1.json`; generate it from FastAPI. Frontend pins it under `frontend/packages/api-client/openapi/` and checks in generated TypeScript. Frontend install/build must not require the backend server or backend dependencies.
- Frontend code must not import backend packages or infrastructure. There is no global shared contracts package.
- Keep the web app, HTTP API, and Celery worker independently deployable. Runtime variables belong in `frontend/.env.local` or `backend/.env`, never at the repository root or inside an image.

## Code quality and security

- Keep handwritten source files below 350 lines when practical; 500 physical lines is the hard maximum, including tests and SQL. Generated files may be exempted only by an explicit check rule.
- Use feature-based frontend structure, reusable accessible UI, modular backend domains, strict TypeScript, explicit dependencies, and clear errors.
- Validate untrusted input at API boundaries. Backend authorization and tenant isolation are authoritative; frontend role checks control presentation only.
- Protect credentials. Commit placeholders in each workspace's `.env.example`, never actual environment values.
- Use versioned Alembic migrations and keep SQL migration assets inside `backend/migrations/sql/`. Preserve data when baselining existing databases; never replay legacy migrations onto an initialized database.
- Sensitive organization changes must use transactions, uniqueness constraints, owner safeguards, and audit records. Avoid duplicated business rules and circular imports.

## Verification

- Install frontend independently with `pnpm --dir frontend install`.
- Install backend in a Python 3.11 virtual environment and use `pip install -r backend/requirements-dev.lock -e backend` for development. Production images use `backend/requirements.lock`.
- Frontend checks from `frontend/`: `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build`.
- Backend checks from `backend/`: `ruff check app worker migrations scripts tests`, `ruff format --check app worker migrations scripts tests`, `pytest`, `alembic upgrade head`, `alembic check`, and `python scripts/export_openapi.py --check`.
- Check the pinned contract with `python backend/scripts/check_contract.py` and root architecture/source-size rules with `node scripts/check-package-boundaries.mjs` and `node scripts/check-source-line-limits.mjs`.
- Do not claim a check passed unless it was run. Report checks that could not run and why.

Do not add product modules during repository architecture work. Preserve current authentication, organization, team, public-site, and audit behavior unless a task explicitly requests a product change.
