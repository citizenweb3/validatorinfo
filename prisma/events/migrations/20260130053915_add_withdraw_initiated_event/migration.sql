-- CreateTable
CREATE TABLE "aztec_withdraw_initiated_events" (
    "id" SERIAL NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "block_number" VARCHAR(256) NOT NULL,
    "transaction_hash" VARCHAR(256) NOT NULL,
    "log_index" INTEGER NOT NULL,
    "attester" VARCHAR(256) NOT NULL,
    "recipient" VARCHAR(256) NOT NULL,
    "amount" VARCHAR(256) NOT NULL,
    "timestamp" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aztec_withdraw_initiated_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "aztec_withdraw_initiated_event_chain_block_idx" ON "aztec_withdraw_initiated_events"("chain_id", "block_number");

-- CreateIndex
CREATE INDEX "aztec_withdraw_initiated_event_chain_attester_idx" ON "aztec_withdraw_initiated_events"("chain_id", "attester");

-- CreateIndex
CREATE UNIQUE INDEX "aztec_withdraw_initiated_event_unique" ON "aztec_withdraw_initiated_events"("chain_id", "transaction_hash", "log_index");
