-- CreateTable
CREATE TABLE "aztec_provider_admin_updated_events" (
    "id" SERIAL NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "block_number" VARCHAR(256) NOT NULL,
    "transaction_hash" VARCHAR(256) NOT NULL,
    "log_index" INTEGER NOT NULL,
    "provider_identifier" VARCHAR(256) NOT NULL,
    "new_admin" VARCHAR(256) NOT NULL,
    "timestamp" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aztec_provider_admin_updated_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "aztec_provider_admin_updated_event_chain_block_idx" ON "aztec_provider_admin_updated_events"("chain_id", "block_number");

-- CreateIndex
CREATE INDEX "aztec_provider_admin_updated_event_chain_admin_idx" ON "aztec_provider_admin_updated_events"("chain_id", "new_admin");

-- CreateIndex
CREATE UNIQUE INDEX "aztec_provider_admin_updated_event_unique" ON "aztec_provider_admin_updated_events"("chain_id", "transaction_hash", "log_index");
