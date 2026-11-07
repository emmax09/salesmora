CREATE TABLE "early_access_leads" (
    "id" VARCHAR(30) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "organization" VARCHAR(120),
    "interest" VARCHAR(32),
    "consentAt" TIMESTAMPTZ(6) NOT NULL,
    "consentVersion" VARCHAR(40) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "early_access_leads_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "contact_messages" (
    "id" VARCHAR(30) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "subject" VARCHAR(160) NOT NULL,
    "message" VARCHAR(4000) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "early_access_leads_email_key" ON "early_access_leads"("email");
CREATE INDEX "early_access_leads_createdAt_idx" ON "early_access_leads"("createdAt");
CREATE INDEX "contact_messages_createdAt_idx" ON "contact_messages"("createdAt");
