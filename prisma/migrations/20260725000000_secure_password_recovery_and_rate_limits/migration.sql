ALTER TABLE "turboware"."admin_users"
  ADD COLUMN IF NOT EXISTS "passwordResetTokenHash" TEXT,
  ADD COLUMN IF NOT EXISTS "passwordResetExpiresAt" TIMESTAMP(3);

CREATE UNIQUE INDEX IF NOT EXISTS "admin_users_passwordResetTokenHash_key"
  ON "turboware"."admin_users"("passwordResetTokenHash");

CREATE TABLE IF NOT EXISTS "turboware"."rate_limit_buckets" (
  "key" TEXT PRIMARY KEY,
  "count" INTEGER NOT NULL,
  "reset_at" TIMESTAMP(3) NOT NULL
);

CREATE INDEX IF NOT EXISTS "rate_limit_buckets_reset_at_idx"
  ON "turboware"."rate_limit_buckets"("reset_at");
