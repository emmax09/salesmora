# ADR 0003: Better Auth and organization-owned authorization

**Status:** Superseded by [ADR 0005](./0005-python-backend-and-celery-worker.md).

## Context

The earlier Phase 2 backend was NestJS with Better Auth and Prisma. The repository later adopted a Python backend so authentication, organization rules, email workflows, API routes, and background processing use one backend language.

## Decision at the time

- Better Auth owned email/password registration, verification, password reset, and cookie sessions.
- NestJS owned organization creation, active workspace selection, memberships, role policy, invitations, audit writes, and SMTP delivery.
- The auth and organization implementation shared the PostgreSQL schema created by Prisma migrations.

## Outcome

The Python FastAPI implementation now owns those backend behaviors. Existing credential hashes, table names, enum values, and SQL migration history are preserved. FastAPI handles API requests, SQLAlchemy maps the existing schema, Alembic controls future migrations, and Celery processes transactional email tasks. The frontend calls the Python auth endpoints through its own typed client.
