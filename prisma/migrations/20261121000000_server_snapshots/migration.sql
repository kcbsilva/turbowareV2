CREATE TABLE "turboware"."server_snapshots" (
    "id" TEXT PRIMARY KEY,
    "payload" JSONB NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
