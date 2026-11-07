# ADR 0001: Prisma PostgreSQL driver adapter

**Status:** Historical. Superseded by [ADR 0005](./0005-python-backend-and-celery-worker.md).

## Context

The original Phase 1 implementation used a TypeScript backend and Prisma ORM for PostgreSQL access.

## Decision at the time

Use Prisma ORM 7 with `@prisma/adapter-pg` and `pg`. Keep runtime connections in `DATABASE_URL` and configure Prisma CLI operations from `DIRECT_URL`.

## Outcome

Prisma migrations are retained under `backend/migrations/sql/legacy_prisma/` as historical SQL. Current runtime models and future migrations use SQLAlchemy 2.0 and Alembic. Existing data is baselined without replaying the old migrations.
