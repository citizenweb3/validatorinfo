-- CreateTable
CREATE TABLE "aztec_slashed_events" (
    "id" SERIAL NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "block_number" VARCHAR(256) NOT NULL,
    "transaction_hash" VARCHAR(256) NOT NULL,
    "log_index" INTEGER NOT NULL,
    "attester" VARCHAR(256) NOT NULL,
    "amount" VARCHAR(256) NOT NULL,
    "timestamp" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aztec_slashed_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aztec_vote_cast_events" (
    "id" SERIAL NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "block_number" VARCHAR(256) NOT NULL,
    "transaction_hash" VARCHAR(256) NOT NULL,
    "log_index" INTEGER NOT NULL,
    "proposal_id" VARCHAR(256) NOT NULL,
    "voter" VARCHAR(256) NOT NULL,
    "support" BOOLEAN NOT NULL,
    "amount" VARCHAR(256) NOT NULL,
    "timestamp" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aztec_vote_cast_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "aztec_slashed_event_chain_block_idx" ON "aztec_slashed_events"("chain_id", "block_number");

-- CreateIndex
CREATE INDEX "aztec_slashed_event_chain_attester_idx" ON "aztec_slashed_events"("chain_id", "attester");

-- CreateIndex
CREATE UNIQUE INDEX "aztec_slashed_event_unique" ON "aztec_slashed_events"("chain_id", "transaction_hash", "log_index");

-- CreateIndex
CREATE INDEX "aztec_vote_cast_event_chain_block_idx" ON "aztec_vote_cast_events"("chain_id", "block_number");

-- CreateIndex
CREATE INDEX "aztec_vote_cast_event_chain_proposal_idx" ON "aztec_vote_cast_events"("chain_id", "proposal_id");

-- CreateIndex
CREATE INDEX "aztec_vote_cast_event_chain_voter_idx" ON "aztec_vote_cast_events"("chain_id", "voter");

-- CreateIndex
CREATE UNIQUE INDEX "aztec_vote_cast_event_unique" ON "aztec_vote_cast_events"("chain_id", "transaction_hash", "log_index");
