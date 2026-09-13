ALTER TABLE "turboware"."client_products"
  ADD COLUMN IF NOT EXISTS "tenantSlug" TEXT;
