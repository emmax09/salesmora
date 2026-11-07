# Salesmora

Salesmora is a multi-tenant platform for customer conversations, sales execution, opportunity protection, and connected business workflows.

## Phase 1 status

The monorepo foundation includes a Next.js app shell, a NestJS API shell, a TypeScript worker shell, shared UI and API packages, Prisma/PostgreSQL tooling, and automated quality checks. It does not include product workflows or business data models yet.

`AGENTS.md` is the standing engineering contract. Read and follow it before making code changes. Handwritten source files may not exceed 500 physical lines, and files at or above 350 lines require a responsibility review.

## Prerequisites

- Node.js 24.15 or newer.
- pnpm 11.9 or newer.
- Docker Desktop or another Docker Compose v2 installation for the local PostgreSQL service.

The Node and package-manager versions are pinned by `.nvmrc` and `package.json`.

## Install

```sh
pnpm install
```

Create a local environment file from the committed example, then replace the local database password consistently in `POSTGRES_PASSWORD`, `DATABASE_URL`, and `DIRECT_URL`:

```sh
cp .env.example .env
```

PowerShell equivalent: `Copy-Item .env.example .env`.

## Environment variables

| Variable | Purpose | Local example |
| --- | --- | --- |
| `NODE_ENV` | API runtime mode | `development` |
| `PORT` | API port | `3001` |
| `WEB_ORIGIN` | Exact allowed browser origin for API CORS | `http://localhost:3000` |
| `POSTGRES_USER` | PostgreSQL role created by Compose | `salesmora` |
| `POSTGRES_PASSWORD` | Local PostgreSQL password placeholder | Set a local value |
| `POSTGRES_DB` | Local database created by Compose | `salesmora` |
| `POSTGRES_PORT` | Host port for PostgreSQL | `5432` |
| `DATABASE_URL` | Runtime PostgreSQL connection URL | Local PostgreSQL URL |
| `DIRECT_URL` | Direct connection used by Prisma CLI migrations | Local PostgreSQL URL |

Do not commit `.env` or real credentials. `DATABASE_URL` and `DIRECT_URL` can differ when a hosted runtime uses a pooled URL and migrations need a direct connection.

## Local database

Start PostgreSQL and wait for the Compose health check:

```sh
pnpm db:up
```

The local service uses PostgreSQL 17 and a named volume. Check connectivity with Prisma's PostgreSQL driver adapter:

```sh
pnpm db:check
```

The schema intentionally has no business models or initial tables. After adding a reviewed domain model, create a versioned development migration with `pnpm db:migrate`; deploy committed migrations with `pnpm db:migrate:deploy`. Check migration state with `pnpm --filter @salesmora/database db:migrate:status`.

Stop the service while preserving its data volume:

```sh
pnpm db:down
```

## Development

Run all three applications in parallel:

```sh
pnpm dev
```

- Web: <http://localhost:3000>
- API health: <http://localhost:3001/api/v1/health>
- Worker: starts as an idle process; no jobs are registered.

To run one app, use `pnpm --filter @salesmora/web dev` or `pnpm --filter @salesmora/api dev`. The API validates its environment at startup and restricts CORS to the exact `WEB_ORIGIN` value. The health route does not query PostgreSQL.

## Shared packages

- `packages/ui` — accessible shared Button, Card, and PageHeader primitives.
- `packages/contracts` — runtime-validated health and structured API error contracts.
- `packages/api-client` — typed client foundation using those shared contracts.
- `packages/database` — Prisma schema/config, PostgreSQL adapter, migration commands, and connectivity check.
- `packages/config` — shared TypeScript, ESLint, and Prettier configuration.
- `apps/web` — Next.js App Router application shell.
- `apps/api` — NestJS modular monolith API shell and `/api/v1/health` endpoint.
- `apps/worker` — TypeScript worker process shell.
- `infrastructure/docker` — local PostgreSQL Compose definition.
- `docs/architecture` — architecture decision records.
- `scripts` — repository quality checks.

## Quality commands

```sh
pnpm check:source-lines
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm db:validate
pnpm db:generate
pnpm build
```

The source check enforces the 500-line maximum on handwritten source and excludes known generated outputs and lockfiles. CI runs the quality commands plus Prisma validation and client generation.

## Troubleshooting

- **Docker command not found:** install/start Docker Desktop or Docker Compose v2, then retry `pnpm db:up`.
- **Compose reports missing variables:** copy `.env.example` to `.env` and provide the PostgreSQL values.
- **PostgreSQL port is in use:** set `POSTGRES_PORT` in `.env` to an available host port and update the host port in `DATABASE_URL` and `DIRECT_URL`.
- **API environment validation fails:** verify `DATABASE_URL` is a PostgreSQL URL, `PORT` is between 1 and 65535, and `WEB_ORIGIN` is the exact frontend origin.
- **Database check cannot connect:** confirm Compose reports the service as healthy, and verify the user, password, database, and host port in both URLs.
- **Prisma CLI uses the wrong connection:** set `DIRECT_URL` to a direct PostgreSQL URL; keep `DATABASE_URL` for runtime access.

## Next milestone

After Phase 1 review, implement identity, organizations, authorization, and audit foundations as the first end-to-end product slice. Do not begin CRM, Inbox, sales pipeline, Guardian, or AI workflows before that foundation is reviewed.
