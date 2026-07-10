-- Dual-cap TurboISP packages: max map items on tiers + subscription cache columns.
-- Also seeds Product slug=turboisp with pricing tiers.
-- Column names match Prisma @@map tables (camelCase).

ALTER TABLE turboware.product_tiers
  ADD COLUMN IF NOT EXISTS "maxMapItems" INTEGER;

ALTER TABLE turboware.subscriptions
  ADD COLUMN IF NOT EXISTS "maxMapItems" INTEGER;

ALTER TABLE turboware.subscriptions
  ADD COLUMN IF NOT EXISTS "lastMapItemSync" TIMESTAMP(3);

-- Ensure TurboISP product exists
INSERT INTO turboware.products (id, name, slug, description, "logoEmoji", active, "sortOrder", "createdAt", "updatedAt")
SELECT
  'seed_turboisp_product',
  'TurboISP',
  'turboisp',
  'ISP OSS/BSS with fiber OSP GIS — licensed by active clients and map plant items.',
  '📡',
  true,
  0,
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM turboware.products WHERE slug = 'turboisp');

-- Upsert dual-cap tiers (name = label used by subscriberTier)
WITH product AS (
  SELECT id FROM turboware.products WHERE slug = 'turboisp' LIMIT 1
),
tiers(name, max_seats, max_map_items, price_br, price_ca, price_us, price_gb, sort_order) AS (
  VALUES
    ('150',   150,   1000,  120::float,  300::float,  375::float,  450::float,  0),
    ('200',   200,   1500,  160::float,  320::float,  400::float,  480::float,  1),
    ('400',   400,   3000,  320::float,  640::float,  800::float,  960::float,  2),
    ('500',   500,   4000,  400::float,  800::float, 1000::float, 1200::float,  3),
    ('1000',  1000,  8000,  600::float, 1200::float, 1500::float, 1800::float,  4),
    ('2000',  2000, 15000,  800::float, 1600::float, 2000::float, 2400::float,  5),
    ('4000',  4000, 30000, 1200::float, 2400::float, 3000::float, 3600::float,  6),
    ('6000',  6000, 45000, 1500::float, 3000::float, 3750::float, 4500::float,  7),
    ('8000',  8000, 60000, 1800::float, 3600::float, 4500::float, 5400::float,  8),
    ('10000', 10000,75000, 2200::float, 4400::float, 5500::float, 6600::float,  9),
    ('12000', 12000,90000, 2600::float, 5200::float, 6500::float, 7800::float, 10)
)
INSERT INTO turboware.product_tiers (
  id, "productId", name, description, "maxSeats", "maxMapItems",
  "priceBR", "priceCA", "priceUS", "priceGB", "sortOrder", "createdAt"
)
SELECT
  'seed_turboisp_tier_' || t.name,
  p.id,
  t.name,
  'Up to ' || t.max_seats || ' clients and ' || t.max_map_items || ' map items',
  t.max_seats,
  t.max_map_items,
  t.price_br,
  t.price_ca,
  t.price_us,
  t.price_gb,
  t.sort_order,
  NOW()
FROM tiers t
CROSS JOIN product p
WHERE NOT EXISTS (
  SELECT 1 FROM turboware.product_tiers pt
  WHERE pt."productId" = p.id AND pt.name = t.name
);

-- Refresh caps/prices on existing tiers for turboisp
UPDATE turboware.product_tiers pt
SET
  "maxSeats" = v.max_seats,
  "maxMapItems" = v.max_map_items,
  "priceBR" = v.price_br,
  "priceCA" = v.price_ca,
  "priceUS" = v.price_us,
  "priceGB" = v.price_gb,
  description = 'Up to ' || v.max_seats || ' clients and ' || v.max_map_items || ' map items',
  "sortOrder" = v.sort_order
FROM (
  VALUES
    ('150',   150,   1000,  120::float,  300::float,  375::float,  450::float,  0),
    ('200',   200,   1500,  160::float,  320::float,  400::float,  480::float,  1),
    ('400',   400,   3000,  320::float,  640::float,  800::float,  960::float,  2),
    ('500',   500,   4000,  400::float,  800::float, 1000::float, 1200::float,  3),
    ('1000',  1000,  8000,  600::float, 1200::float, 1500::float, 1800::float,  4),
    ('2000',  2000, 15000,  800::float, 1600::float, 2000::float, 2400::float,  5),
    ('4000',  4000, 30000, 1200::float, 2400::float, 3000::float, 3600::float,  6),
    ('6000',  6000, 45000, 1500::float, 3000::float, 3750::float, 4500::float,  7),
    ('8000',  8000, 60000, 1800::float, 3600::float, 4500::float, 5400::float,  8),
    ('10000', 10000,75000, 2200::float, 4400::float, 5500::float, 6600::float,  9),
    ('12000', 12000,90000, 2600::float, 5200::float, 6500::float, 7800::float, 10)
) AS v(name, max_seats, max_map_items, price_br, price_ca, price_us, price_gb, sort_order)
JOIN turboware.products p ON p.slug = 'turboisp'
WHERE pt."productId" = p.id AND pt.name = v.name;

-- Backfill subscription.maxMapItems from current subscriberTier label
UPDATE turboware.subscriptions s
SET "maxMapItems" = pt."maxMapItems"
FROM turboware.product_tiers pt
JOIN turboware.products p ON p.id = pt."productId" AND p.slug = 'turboisp'
WHERE s."subscriberTier" = pt.name
  AND s."maxMapItems" IS NULL;
