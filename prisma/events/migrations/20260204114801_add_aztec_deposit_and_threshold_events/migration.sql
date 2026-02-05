-- CreateTable
CREATE TABLE "aztec_deposit_events" (
    "id" SERIAL NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "block_number" VARCHAR(256) NOT NULL,
    "transaction_hash" VARCHAR(256) NOT NULL,
    "log_index" INTEGER NOT NULL,
    "attester" VARCHAR(256) NOT NULL,
    "withdrawer" VARCHAR(256) NOT NULL,
    "public_key_in_g1_x" VARCHAR(256) NOT NULL,
    "public_key_in_g1_y" VARCHAR(256) NOT NULL,
    "public_key_in_g2_x0" VARCHAR(256) NOT NULL,
    "public_key_in_g2_x1" VARCHAR(256) NOT NULL,
    "public_key_in_g2_y0" VARCHAR(256) NOT NULL,
    "public_key_in_g2_y1" VARCHAR(256) NOT NULL,
    "proof_of_possession_x" VARCHAR(256) NOT NULL,
    "proof_of_possession_y" VARCHAR(256) NOT NULL,
    "amount" VARCHAR(256) NOT NULL,
    "timestamp" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aztec_deposit_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aztec_local_ejection_threshold_updated_events" (
    "id" SERIAL NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "block_number" VARCHAR(256) NOT NULL,
    "transaction_hash" VARCHAR(256) NOT NULL,
    "log_index" INTEGER NOT NULL,
    "old_local_ejection_threshold" VARCHAR(256) NOT NULL,
    "new_local_ejection_threshold" VARCHAR(256) NOT NULL,
    "timestamp" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aztec_local_ejection_threshold_updated_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "aztec_deposit_event_chain_attester_idx" ON "aztec_deposit_events"("chain_id", "attester");

-- CreateIndex
CREATE INDEX "aztec_deposit_event_chain_block_idx" ON "aztec_deposit_events"("chain_id", "block_number");

-- CreateIndex
CREATE UNIQUE INDEX "aztec_deposit_event_unique" ON "aztec_deposit_events"("chain_id", "transaction_hash", "log_index");

-- CreateIndex
CREATE INDEX "aztec_local_ejection_threshold_updated_event_chain_block_idx" ON "aztec_local_ejection_threshold_updated_events"("chain_id", "block_number");

-- CreateIndex
CREATE UNIQUE INDEX "aztec_local_ejection_threshold_updated_event_unique" ON "aztec_local_ejection_threshold_updated_events"("chain_id", "transaction_hash", "log_index");
