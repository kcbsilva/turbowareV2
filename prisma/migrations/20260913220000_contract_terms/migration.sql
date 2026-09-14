ALTER TABLE turboware.clients ADD COLUMN "contractTerms" JSONB;

CREATE TABLE turboware.platform_settings (
    "id" TEXT NOT NULL,
    "providerTerms" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_settings_pkey" PRIMARY KEY ("id")
);
