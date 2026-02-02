-- CreateTable
CREATE TABLE "aztec_provider_registered_events" (
    "id" SERIAL NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "block_number" VARCHAR(256) NOT NULL,
    "transaction_hash" VARCHAR(256) NOT NULL,
    "log_index" INTEGER NOT NULL,
    "provider_identifier" VARCHAR(256) NOT NULL,
    "provider_admin" VARCHAR(256) NOT NULL,
    "timestamp" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aztec_provider_registered_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "aztec_provider_registered_event_chain_block_idx" ON "aztec_provider_registered_events"("chain_id", "block_number");

-- CreateIndex
CREATE INDEX "aztec_provider_registered_event_chain_admin_idx" ON "aztec_provider_registered_events"("chain_id", "provider_admin");

-- CreateIndex
CREATE UNIQUE INDEX "aztec_provider_registered_event_unique" ON "aztec_provider_registered_events"("chain_id", "transaction_hash", "log_index");
