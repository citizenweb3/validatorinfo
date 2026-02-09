-- CreateTable for Events Database
CREATE TABLE IF NOT EXISTS "aztec_attester_events" (
    "id" SERIAL NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "block_number" VARCHAR(256) NOT NULL,
    "transaction_hash" VARCHAR(256) NOT NULL,
    "log_index" INTEGER NOT NULL,
    "provider_id" VARCHAR(256) NOT NULL,
    "provider_address" VARCHAR(256),
    "attesters" TEXT[] NOT NULL,
    "timestamp" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aztec_attester_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "aztec_attester_event_unique" ON "aztec_attester_events"("chain_id", "transaction_hash", "log_index");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "aztec_attester_event_chain_block_idx" ON "aztec_attester_events"("chain_id", "block_number");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "aztec_attester_event_chain_provider_idx" ON "aztec_attester_events"("chain_id", "provider_address");