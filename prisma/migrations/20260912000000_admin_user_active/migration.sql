ALTER TABLE "turboware"."admin_users"
  ADD COLUMN IF NOT EXISTS "active" BOOLEAN NOT NULL DEFAULT true;
