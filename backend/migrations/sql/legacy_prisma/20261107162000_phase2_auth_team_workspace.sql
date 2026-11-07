-- Keep Phase 1 account hashes while moving credential ownership to Better Auth.
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REVOKED', 'EXPIRED');
CREATE TYPE "InvitationDeliveryStatus" AS ENUM ('ACCEPTED_BY_SMTP', 'FAILED');

ALTER TYPE "AuditAction" ADD VALUE 'ORGANIZATION_UPDATED';
ALTER TYPE "AuditAction" ADD VALUE 'MEMBERSHIP_CREATED';
ALTER TYPE "AuditAction" ADD VALUE 'MEMBERSHIP_ROLE_CHANGED';
ALTER TYPE "AuditAction" ADD VALUE 'MEMBERSHIP_REMOVED';
ALTER TYPE "AuditAction" ADD VALUE 'INVITATION_CREATED';
ALTER TYPE "AuditAction" ADD VALUE 'INVITATION_ACCEPTED';
ALTER TYPE "AuditAction" ADD VALUE 'INVITATION_REVOKED';
ALTER TYPE "AuditAction" ADD VALUE 'OWNERSHIP_TRANSFERRED';
ALTER TYPE "AuditAction" ADD VALUE 'ACTIVE_ORGANIZATION_CHANGED';

ALTER TYPE "OrganizationRole" ADD VALUE 'MANAGER';
ALTER TYPE "OrganizationRole" ADD VALUE 'VIEWER';

DELETE FROM "sessions";

ALTER TABLE "organizations"
  ADD COLUMN "country" CHAR(2),
  ADD COLUMN "defaultCurrency" CHAR(3) NOT NULL DEFAULT 'USD',
  ADD COLUMN "industry" VARCHAR(100),
  ADD COLUMN "timezone" VARCHAR(64) NOT NULL DEFAULT 'UTC',
  ADD COLUMN "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "organizations" ALTER COLUMN "updatedAt" DROP DEFAULT;

ALTER TABLE "users"
  ADD COLUMN "emailVerified" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "image" TEXT,
  ADD COLUMN "name" VARCHAR(255) NOT NULL DEFAULT '';

UPDATE "users" SET "name" = split_part("email", '@', 1) WHERE "name" = '';

CREATE TABLE "accounts" (
  "id" VARCHAR(30) NOT NULL,
  "accountId" VARCHAR(255) NOT NULL,
  "providerId" VARCHAR(100) NOT NULL,
  "userId" VARCHAR(30) NOT NULL,
  "accessToken" TEXT,
  "refreshToken" TEXT,
  "idToken" TEXT,
  "accessTokenExpiresAt" TIMESTAMPTZ(6),
  "refreshTokenExpiresAt" TIMESTAMPTZ(6),
  "scope" TEXT,
  "password" TEXT,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

INSERT INTO "accounts" ("id", "accountId", "providerId", "userId", "password", "createdAt", "updatedAt")
SELECT "id", "id", 'credential', "id", "passwordHash", "createdAt", "updatedAt"
FROM "users"
WHERE "passwordHash" IS NOT NULL;

ALTER TABLE "users" DROP COLUMN "passwordHash";

ALTER TABLE "sessions"
  DROP COLUMN "revokedAt",
  DROP COLUMN "tokenHash",
  ADD COLUMN "activeOrganizationId" VARCHAR(30),
  ADD COLUMN "ipAddress" VARCHAR(255),
  ADD COLUMN "token" TEXT NOT NULL,
  ADD COLUMN "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "userAgent" TEXT;

ALTER TABLE "sessions" ALTER COLUMN "updatedAt" DROP DEFAULT;

CREATE TABLE "verifications" (
  "id" VARCHAR(30) NOT NULL,
  "identifier" VARCHAR(255) NOT NULL,
  "value" TEXT NOT NULL,
  "expiresAt" TIMESTAMPTZ(6) NOT NULL,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "verifications_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "invitations" (
  "id" VARCHAR(30) NOT NULL,
  "organizationId" VARCHAR(30) NOT NULL,
  "email" VARCHAR(254) NOT NULL,
  "role" "OrganizationRole" NOT NULL,
  "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
  "deliveryStatus" "InvitationDeliveryStatus" NOT NULL DEFAULT 'FAILED',
  "tokenHash" CHAR(64) NOT NULL,
  "expiresAt" TIMESTAMPTZ(6) NOT NULL,
  "acceptedAt" TIMESTAMPTZ(6),
  "revokedAt" TIMESTAMPTZ(6),
  "invitedById" VARCHAR(30) NOT NULL,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "invitations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "organization_creation_keys" (
  "key" UUID NOT NULL,
  "userId" VARCHAR(30) NOT NULL,
  "organizationId" VARCHAR(30) NOT NULL,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "organization_creation_keys_pkey" PRIMARY KEY ("key")
);

CREATE INDEX "accounts_userId_idx" ON "accounts"("userId");
CREATE UNIQUE INDEX "accounts_providerId_accountId_key" ON "accounts"("providerId", "accountId");
CREATE INDEX "verifications_identifier_idx" ON "verifications"("identifier");
CREATE UNIQUE INDEX "invitations_tokenHash_key" ON "invitations"("tokenHash");
CREATE INDEX "invitations_organizationId_status_expiresAt_idx" ON "invitations"("organizationId", "status", "expiresAt");
CREATE INDEX "invitations_email_status_idx" ON "invitations"("email", "status");
CREATE INDEX "organization_creation_keys_createdAt_idx" ON "organization_creation_keys"("createdAt");
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");
CREATE INDEX "sessions_activeOrganizationId_idx" ON "sessions"("activeOrganizationId");

ALTER TABLE "sessions"
  ADD CONSTRAINT "sessions_activeOrganizationId_fkey"
  FOREIGN KEY ("activeOrganizationId") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "accounts"
  ADD CONSTRAINT "accounts_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "invitations"
  ADD CONSTRAINT "invitations_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "invitations"
  ADD CONSTRAINT "invitations_invitedById_fkey"
  FOREIGN KEY ("invitedById") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "organization_creation_keys"
  ADD CONSTRAINT "organization_creation_keys_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "organization_creation_keys"
  ADD CONSTRAINT "organization_creation_keys_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
