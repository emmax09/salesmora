# Salesmora — Standing Engineering Instructions

**Applies to:** every coding assistant and human contributor operating inside this repository.

**Read this file at the beginning of every development task.** Treat these instructions as the standing project contract. Do not disregard them because a feature request is urgent or because a shortcut appears faster. If a requested change conflicts with these rules, explain the trade-off and seek an explicit architectural decision before proceeding.

> This file helps coding assistants operating in the repository preserve standards across sessions. It is not magical long-term memory, and **does not enforce rules on its own**. Use continuous integration (CI), tooling, code review, and repository permissions to enforce the mandatory checks.

## 1. Product and architectural identity

- Product name: **Salesmora**. Use this exact spelling consistently across product UI, documentation, code comments, and setup examples.
- Build a globally usable, multi-tenant B2B SaaS platform for customer conversations, sales, AI assistance, opportunity tracking, and business workflows.
- Architecture: **pnpm + Turborepo monorepo**; **Next.js web**, **NestJS modular-monolith API**, **TypeScript worker**, **PostgreSQL**.
- Prefer a well-structured modular monolith to premature microservices.
- Develop one reliable vertical feature at a time, not pages of disconnected demo UI.
- Preserve the long-term module boundaries even when only the MVP subset exists.

## 2. Mandatory file-size limits

1. **Hard maximum: 500 physical lines for every handwritten source file**, including `.ts`, `.tsx`, `.js`, `.jsx`, `.css`, `.scss`, `.sql`, and handwritten test files. Count blank and comment lines. Do not merge changes that exceed it.
2. **Soft threshold: 350 lines.** At or above this threshold, review whether responsibilities should be extracted. A cohesive file may remain between 350 and 500 lines if justified in the pull request.
3. **Prefer smaller, cohesive units** (often 50–200 lines for components and use cases), but never extract meaningless files solely to meet a number.
4. Do not bypass the rule by inserting multiple unrelated classes/functions in one file, using enormous inline objects, or converting source into one-line/minified content.
5. Generated output, dependency lockfiles, build artifacts, and vendor code are exceptions only when explicitly allowlisted by CI. Never manually edit generated artifacts. Do not use those exceptions for handwritten code.
6. Documentation may reasonably exceed 500 lines if necessary; split long design documents by topic for readability. The hard cap specifically protects handwritten **source code**.
7. Enforce this policy automatically in CI with a script/check and block merging on failure. CI must report the path and line count for each violation.

## 3. One responsibility per module, component, and file

- A feature belongs in its named feature/domain folder.
- Route files should be thin; assemble screens and route metadata rather than containing business logic.
- UI components render and coordinate user interaction; they do not talk directly to the database or payment providers.
- Backend controllers validate/map requests; application use cases orchestrate; domain code owns business rules; infrastructure adapters implement storage and external APIs.
- Avoid generic `helpers.ts`, `utils.ts`, `service.ts`, or `index.ts` dumping grounds. Generic utilities must genuinely be cross-domain.
- Avoid giant React components, god services, circular imports, duplicated schemas, and import chains that cross module internals.
- Prefer dependency injection and explicit public module APIs; do not reach into another module's private implementation.

## 4. Reuse without over-abstraction

- Put shared accessible UI primitives, design tokens, and generic components in `packages/ui`.
- Keep feature-specific UI in `apps/web/src/features/<feature>/components/`.
- Put validated cross-application contracts in `packages/contracts` and typed client access in `packages/api-client`.
- Reuse established patterns, but do not create a configurable mega-component with dozens of conditional props.
- Before creating a new component/service, search for an existing appropriate abstraction.
- Extract common code after genuine reuse emerges; avoid speculative frameworks.

## 5. Dependency and ownership rules

- Frontend never imports backend infrastructure or connects directly to the production database.
- No frontend feature imports private internals from another feature. Use explicitly exported shared interfaces or app-level composition.
- External channel/payment/AI SDK calls belong in integration adapters, not scattered throughout business code.
- Business modules own writes to their domain records; cross-module operations use supported APIs/use cases or documented events.
- Keep domain logic independent of framework and vendor specifics where practical.
- Validate all untrusted input and external API responses at boundaries.
- Use explicit IDs, currency codes, timestamps, statuses, and typed events; avoid magic strings.

## 6. Database and SaaS safety

- Every organization-owned record and query must enforce tenant isolation **server-side**.
- Require authorization for every sensitive read, mutation, and agent tool action.
- Never trust organization IDs, pricing, payment completion, or inventory claims solely from browser input or AI output.
- Financial actions require authoritative provider confirmation and explicit permission.
- Use versioned migrations, transactions where needed, uniqueness constraints, indexes, and appropriate audit logs.
- Enforce idempotency for retries and webhook/event processing; do not generate duplicate charges, refunds, orders, or messages.
- Protect secrets; use `.env.example` with placeholders, never committed real credentials.
- Follow applicable privacy rules, retention requirements, consent and messaging restrictions, and least-privilege access.

## 7. AI-specific requirements

- AI can propose or execute only explicitly authorized actions.
- Use reliable, scoped business sources to answer questions about products, prices, availability, policy, orders, and commitments.
- Never treat prompt text or customer messages as trusted instructions to the system.
- Provide a human escalation path and a way to pause/disable agent actions.
- Persist AI action attempts, approvals, outcomes, errors, and traceable audit events where appropriate.
- Distinguish `requested`, `pending`, `provider_accepted`, `completed`, `failed`, and `cancelled` states as relevant; never equate an API acceptance with real-world completion.
- Keep prompts and agent policies versioned and testable, rather than scattering long string literals throughout source files.

## 8. Quality gates required for each change

Before describing a change as complete:

1. Ensure the implementation follows the correct feature/domain boundary.
2. Run formatter and linter.
3. Run TypeScript type checks.
4. Run unit and relevant integration tests; add negative/error-path tests for new logic.
5. Run a build for impacted packages/apps when feasible.
6. Check all handwritten source files remain **<=500 lines**; review files >=350 lines.
7. Validate permissions, tenant scoping, loading/empty/error states, and responsive/accessibility behavior where relevant.
8. Update contracts, docs, examples, and migrations if behavior changed.
9. Report what was actually tested and any unverified or missing work. Never claim a test or feature works without verifying it.

For important workflows, add end-to-end, security, performance, or failure-recovery tests as appropriate.

## 9. Development process

- Begin with the smallest end-to-end, user-visible slice that has business value.
- Define acceptance criteria before coding; identify modules and data contracts first.
- Implement in small commits and short-lived branches; use pull requests and review.
- Prefer clear names, early returns, typed contracts, structured errors, and purposeful tests.
- No placeholder features labeled as finished, mock metrics presented as real, or swallowed errors.
- Use consistent loading, error, empty, and unauthorized UI states.
- Keep architecture choices documented in short ADRs under `docs/architecture/`.
- Make infrastructure and version changes intentionally, not opportunistically within unrelated feature work.

## 10. Initial release scope

**Primary navigation (8 business tabs):** Overview, Inbox, Customers, Sales, Guardian, AI Agents, Automations, Analytics. Settings & Integrations is utility navigation.

**Initial business implementation order:**

1. Repository/tooling and CI quality gates.
2. Identity, organizations, authorization, and audit foundation.
3. Shared application shell and UI primitives.
4. Website chat, conversations, messages, basic customer records.
5. Sales opportunities, assignments, tasks, commitments, Guardian alerts.
6. Knowledge-grounded AI drafting, approval-controlled actions, verification.
7. Approved external channels, analytics, hardening, pilot.

Defer complex commerce, campaigns, global multi-region hosting, advanced automation builders, digital twins, and large-scale multi-agent autonomy until the core workflow is tested and validated.

## 11. How to work with this document

- **Do not casually remove or weaken these rules.** Propose changes in a dedicated pull request with rationale and owner approval.
- Put feature-specific instructions in a nested `AGENTS.md` only if they add detail without contradicting this root policy.
- At the start of each coding task, identify the affected app/package/module and relevant instructions.
- At the end of each coding task, summarize files changed, tests run, line-limit compliance, and any outstanding issues.

**Guiding principle:** Build code that another engineer can understand, test, modify, and deploy without untangling a giant file or guessing which module owns the behavior.
