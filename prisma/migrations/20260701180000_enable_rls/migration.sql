-- Enable RLS on Turboware billing tables (Supabase Security Advisor).
-- TurbowareV2 connects via Prisma as postgres (bypasses RLS).
-- Blocks anon/authenticated PostgREST access without explicit policies.

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'turboware'
      AND tablename IN (
        'clients', 'client_notes', 'licenses', 'activations', 'subscriptions',
        'invoices', 'admin_users', 'support_tickets', 'ticket_messages',
        'products', 'product_tiers', 'client_products'
      )
      AND NOT rowsecurity
  LOOP
    EXECUTE format('ALTER TABLE turboware.%I ENABLE ROW LEVEL SECURITY', r.tablename);
  END LOOP;
END $$;
