CREATE TYPE turboware."ContractStatus" AS ENUM ('DRAFT', 'ACTIVE', 'SUSPENDED', 'CANCELLED');

CREATE TABLE turboware.contracts (
  id TEXT PRIMARY KEY,
  "clientId" TEXT NOT NULL,
  number TEXT NOT NULL,
  title TEXT NOT NULL,
  status turboware."ContractStatus" NOT NULL DEFAULT 'ACTIVE',
  "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "endsAt" TIMESTAMP(3),
  notes TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT contracts_clientId_fkey
    FOREIGN KEY ("clientId") REFERENCES turboware.clients(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX contracts_clientId_createdAt_idx
  ON turboware.contracts ("clientId", "createdAt" DESC);

ALTER TABLE turboware.client_products
  ADD COLUMN IF NOT EXISTS "contractId" TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'client_products_contractId_fkey'
  ) THEN
    ALTER TABLE turboware.client_products
      ADD CONSTRAINT client_products_contractId_fkey
      FOREIGN KEY ("contractId") REFERENCES turboware.contracts(id)
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS client_products_contractId_idx
  ON turboware.client_products ("contractId");

INSERT INTO turboware.contracts (id, "clientId", number, title, status, "startsAt", "createdAt", "updatedAt")
SELECT
  'ctr_' || c.id,
  c.id,
  'CTR-' || to_char(COALESCE(MIN(cp."createdAt"), NOW()), 'YYYYMM') || '-' || upper(right(regexp_replace(c.id, '[^a-zA-Z0-9]', '', 'g'), 6)),
  COALESCE(NULLIF(c.company, ''), c.name, 'Contract'),
  'ACTIVE',
  COALESCE(MIN(cp."createdAt"), NOW()),
  NOW(),
  NOW()
FROM turboware.clients c
JOIN turboware.client_products cp ON cp."clientId" = c.id
WHERE NOT EXISTS (
  SELECT 1 FROM turboware.contracts existing WHERE existing."clientId" = c.id
)
GROUP BY c.id, c.company, c.name;

UPDATE turboware.client_products cp
SET "contractId" = ctr.id
FROM turboware.contracts ctr
WHERE ctr."clientId" = cp."clientId"
  AND cp."contractId" IS NULL;

ALTER TABLE turboware.contracts ENABLE ROW LEVEL SECURITY;
