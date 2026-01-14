-- CreateTable
CREATE TABLE "aztec_signal_cast_events" (
    "id" SERIAL NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "block_number" VARCHAR(256) NOT NULL,
    "transaction_hash" VARCHAR(256) NOT NULL,
    "log_index" INTEGER NOT NULL,
    "payload" VARCHAR(256) NOT NULL,
    "round" VARCHAR(256) NOT NULL,
    "signaler" VARCHAR(256) NOT NULL,
    "timestamp" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aztec_signal_cast_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aztec_payload_submitted_events" (
    "id" SERIAL NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "block_number" VARCHAR(256) NOT NULL,
    "transaction_hash" VARCHAR(256) NOT NULL,
    "log_index" INTEGER NOT NULL,
    "payload" VARCHAR(256) NOT NULL,
    "round" VARCHAR(256) NOT NULL,
    "timestamp" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aztec_payload_submitted_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "aztec_signal_cast_event_chain_block_idx" ON "aztec_signal_cast_events"("chain_id", "block_number");

-- CreateIndex
CREATE INDEX "aztec_signal_cast_event_chain_payload_idx" ON "aztec_signal_cast_events"("chain_id", "payload");

-- CreateIndex
CREATE INDEX "aztec_signal_cast_event_chain_signaler_idx" ON "aztec_signal_cast_events"("chain_id", "signaler");

-- CreateIndex
CREATE UNIQUE INDEX "aztec_signal_cast_event_unique" ON "aztec_signal_cast_events"("chain_id", "transaction_hash", "log_index");

-- CreateIndex
CREATE INDEX "aztec_payload_submitted_event_chain_block_idx" ON "aztec_payload_submitted_events"("chain_id", "block_number");

-- CreateIndex
CREATE INDEX "aztec_payload_submitted_event_chain_payload_idx" ON "aztec_payload_submitted_events"("chain_id", "payload");

-- CreateIndex
CREATE UNIQUE INDEX "aztec_payload_submitted_event_unique" ON "aztec_payload_submitted_events"("chain_id", "transaction_hash", "log_index");
