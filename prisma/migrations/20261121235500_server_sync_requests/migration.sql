CREATE TABLE "turboware"."server_sync_requests" (
    "repository" TEXT PRIMARY KEY,
    "serverId" TEXT NOT NULL,
    "requestId" TEXT NOT NULL UNIQUE,
    "status" TEXT NOT NULL CHECK ("status" IN ('queued', 'running', 'succeeded', 'failed')),
    "requestedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL
);

CREATE INDEX "server_sync_requests_serverId_status_requestedAt_idx"
ON "turboware"."server_sync_requests" ("serverId", "status", "requestedAt");
