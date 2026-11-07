# ADR 0005: Python backend and Celery worker

**Status:** Accepted  
**Date:** 2026-11-07

## Context

Salesmora needs one backend language for API, authentication, integrations, messaging, future AI agents, and background processing. The previous backend used NestJS, Prisma, and BullMQ. Python is the selected backend language so future AI and integration work does not introduce another server runtime.

## Decision

- Use Python 3.11, FastAPI, Pydantic, SQLAlchemy 2.0, PostgreSQL, and Alembic for the backend.
- Use Celery for background tasks and Redis for its broker and result backend. Run the API and worker as separate processes with separate Dockerfiles and runtime commands.
- Keep authentication, organization access, invitations, audit writes, public forms, and API behavior in Python. Keep the frontend as Next.js and TypeScript.
- Generate the versioned OpenAPI v1 document from FastAPI and commit it at `backend/openapi/v1.json`. Generate frontend TypeScript declarations from the pinned frontend snapshot, not from a running API.
- Retain the existing PostgreSQL schema, table names, column names, enum types, credentials, and user records. Move historical SQL migration files into `backend/migrations/sql/legacy_prisma/`.
- The first Alembic revision is a safe baseline: on an empty database it applies the preserved SQL history in order; on a complete initialized database it validates required tables and columns and stamps the baseline without replaying data-changing SQL. Incomplete existing schemas fail with a clear error and require review.
- Store newly issued session tokens as keyed SHA-256 digests in PostgreSQL while returning opaque tokens only in HttpOnly cookies. Accept an existing raw session token once and migrate it to a keyed digest after successful authentication.
- Preserve existing scrypt credential hashes so current users can continue signing in. Python owns verification/reset flows, with queued transactional email sent by Celery.
- Keep Python dependencies and a lock file under `backend/`; do not add a root package workspace or a second backend language.

## Consequences

- The API, queue tasks, and future backend domains share Python models and business rules without requiring a Node server runtime.
- API and worker images can be built and deployed separately. Worker processes can scale independently from HTTP traffic.
- Alembic becomes the supported migration tool. Prisma files remain historical migration inputs only and do not remain an active backend runtime dependency.
- The existing frontend remains independently installable and buildable from its pinned API contract. Its auth forms call the FastAPI auth routes and no longer install a JavaScript auth server library.
- Transactional email requires a running Redis broker, a Celery worker, and SMTP configuration. Production SMTP delivery and monitoring are separate deployment tasks.
- Future AI, CRM, messaging, Guardian, and integration modules remain out of scope until specifically requested.
