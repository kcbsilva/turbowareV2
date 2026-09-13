-- Ad-hoc charges (installation/importation/custom) and optional payment plans.

ALTER TYPE turboware."InvoiceType" ADD VALUE IF NOT EXISTS 'IMPORTATION';
ALTER TYPE turboware."InvoiceType" ADD VALUE IF NOT EXISTS 'CUSTOM';

ALTER TABLE turboware.subscriptions
  ADD COLUMN IF NOT EXISTS "paymentPlanAllowed" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS turboware.payment_plans (
  id TEXT PRIMARY KEY,
  "subscriptionId" TEXT NOT NULL,
  "totalAmount" DOUBLE PRECISION NOT NULL,
  "installmentCount" INTEGER NOT NULL,
  "intervalDays" INTEGER NOT NULL DEFAULT 30,
  notes TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT payment_plans_subscriptionId_fkey
    FOREIGN KEY ("subscriptionId") REFERENCES turboware.subscriptions(id) ON DELETE CASCADE ON UPDATE CASCADE
);

ALTER TABLE turboware.invoices
  ADD COLUMN IF NOT EXISTS "paymentPlanId" TEXT;

ALTER TABLE turboware.invoices
  ADD COLUMN IF NOT EXISTS "installmentNo" INTEGER;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'invoices_paymentPlanId_fkey'
  ) THEN
    ALTER TABLE turboware.invoices
      ADD CONSTRAINT invoices_paymentPlanId_fkey
      FOREIGN KEY ("paymentPlanId") REFERENCES turboware.payment_plans(id)
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
