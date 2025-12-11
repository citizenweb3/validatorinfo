-- CreateTable
CREATE TABLE "aztec_staked_events" (
    "id" SERIAL NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "block_number" VARCHAR(256) NOT NULL,
    "transaction_hash" VARCHAR(256) NOT NULL,
    "log_index" INTEGER NOT NULL,
    "provider_id" VARCHAR(256) NOT NULL,
    "provider_address" VARCHAR(256),
    "rollup_address" VARCHAR(256) NOT NULL,
    "attester_address" VARCHAR(256) NOT NULL,
    "timestamp" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aztec_staked_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "aztec_staked_event_chain_block_idx" ON "aztec_staked_events"("chain_id", "block_number");

-- CreateIndex
CREATE INDEX "aztec_staked_event_chain_provider_idx" ON "aztec_staked_events"("chain_id", "provider_address");

-- CreateIndex
CREATE INDEX "aztec_staked_event_chain_attester_idx" ON "aztec_staked_events"("chain_id", "attester_address");

-- CreateIndex
CREATE UNIQUE INDEX "aztec_staked_event_unique" ON "aztec_staked_events"("chain_id", "transaction_hash", "log_index");
