CREATE TYPE turboware."ClientDocumentKind" AS ENUM (
  'ID_FRONT',
  'ID_BACK',
  'PASSPORT',
  'SELFIE',
  'PROOF_OF_ADDRESS',
  'COMPANY',
  'CONTRACT',
  'OTHER'
);

CREATE TABLE turboware.client_documents (
  id TEXT PRIMARY KEY,
  "clientId" TEXT NOT NULL,
  kind turboware."ClientDocumentKind" NOT NULL,
  title TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "sizeBytes" INTEGER NOT NULL,
  data BYTEA NOT NULL,
  notes TEXT,
  "uploadedBy" TEXT NOT NULL DEFAULT 'Admin',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT client_documents_clientId_fkey
    FOREIGN KEY ("clientId") REFERENCES turboware.clients(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX client_documents_clientId_createdAt_idx
  ON turboware.client_documents ("clientId", "createdAt" DESC);

ALTER TABLE turboware.client_documents ENABLE ROW LEVEL SECURITY;
