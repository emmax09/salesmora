-- Match the non-null user name field to the schema after backfilling legacy rows.
ALTER TABLE "users" ALTER COLUMN "name" DROP DEFAULT;
