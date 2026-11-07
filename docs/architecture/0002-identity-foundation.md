# ADR 0002: Identity and organization foundation

## Status

Historical Phase 1 decision. Phase 2 identity and authorization decisions are recorded in [ADR 0003](./0003-better-auth-and-organization-authorization.md).

## Context

Salesmora needs a multi-tenant identity boundary before customer, conversation, or sales records are added. The first workflow must establish an account, an initial organization, a server-checked membership, an auditable session, and a usable sign-in path.

## Decision

- Use email/password registration. Normalize emails to NFC and lowercase before storage and lookup; require passwords with at least 12 characters and a maximum of 128.
- Hash passwords with Node.js `crypto.scrypt`, using N=2^14, r=8, p=5, a unique 16-byte salt, and a 64-byte derived key. OWASP lists these settings as its scrypt fallback when Argon2id is unavailable. The repository's package policy blocks unapproved native install scripts, so the implementation avoids a native password-hashing addon.
- Create the user, initial organization, `OWNER` membership, session, and audit records in one Prisma transaction.
- Issue a random opaque session token in an HttpOnly, SameSite=Strict cookie scoped to `/api/v1`; use `Secure` in production. Store only its SHA-256 digest in PostgreSQL. Sessions expire after seven days and can be revoked on logout.
- Support organization roles `OWNER`, `ADMIN`, and `MEMBER`. Every organization read first checks the caller's membership. Only owners and admins can read that organization's audit history.
- Limit requests globally by IP and apply a tighter in-process limit per IP and normalized email to registration and login. A shared rate-limit store is needed before running multiple API instances.
- Keep email verification, password recovery, and member invitations out of scope until an email-delivery provider is selected.

## Consequences

- The `identity_foundation` migration creates users, organizations, memberships, sessions, and audit events with database-enforced unique keys, foreign keys, and query indexes.
- Browser requests use the shared API client with credentials enabled. The API accepts state-changing auth and organization requests only from the configured web origin when an `Origin` header is present.
- Public registration is available in this initial slice. Add verification, recovery, and invitation workflows before relying on email ownership for sensitive external workflows.

## References

- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [NestJS rate limiting](https://docs.nestjs.com/security/rate-limiting)
