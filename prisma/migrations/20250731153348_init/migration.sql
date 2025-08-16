-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('PROPOSAL_STATUS_UNSPECIFIED', 'PROPOSAL_STATUS_DEPOSIT_PERIOD', 'PROPOSAL_STATUS_VOTING_PERIOD', 'PROPOSAL_STATUS_PASSED', 'PROPOSAL_STATUS_REJECTED', 'PROPOSAL_STATUS_FAILED');

-- CreateEnum
CREATE TYPE "VoteOption" AS ENUM ('YES', 'NO', 'ABSTAIN', 'VETO', 'UNSPECIFIED');

-- CreateTable
CREATE TABLE "accounts" (
    "id" SERIAL NOT NULL,
    "username" TEXT,
    "main_address" VARCHAR(256) NOT NULL,
    "core_team" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "addresses" (
    "id" SERIAL NOT NULL,
    "main_address" VARCHAR(256) NOT NULL,
    "address" TEXT NOT NULL,
    "chain_id" INTEGER NOT NULL,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aprs" (
    "id" SERIAL NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "value" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aprs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chain_params" (
    "id" SERIAL NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "coin_type" INTEGER NOT NULL,
    "denom" VARCHAR(256) NOT NULL,
    "minimal_denom" VARCHAR(256) NOT NULL,
    "coin_decimals" INTEGER NOT NULL,
    "bech32_prefix" VARCHAR(32) NOT NULL,
    "max_validators" INTEGER,
    "community_tax" DOUBLE PRECISION,
    "unbonding_time" INTEGER,
    "downtime_jail_duration" TEXT,
    "signed_blocks_window" INTEGER,
    "key_algos" TEXT NOT NULL DEFAULT '',
    "daemon_name" TEXT NOT NULL DEFAULT '',
    "node_home" TEXT NOT NULL DEFAULT '',
    "peers" TEXT NOT NULL DEFAULT '',
    "seeds" TEXT NOT NULL DEFAULT '',
    "binaries" TEXT NOT NULL DEFAULT '',
    "genesis" TEXT NOT NULL DEFAULT '',
    "proposal_creation_cost" INTEGER,
    "voting_period" TEXT,
    "voting_participation_rate" DOUBLE PRECISION,
    "quorum_threshold" DOUBLE PRECISION,

    CONSTRAINT "chain_params_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chains" (
    "id" SERIAL NOT NULL,
    "ecosystem" VARCHAR(256) NOT NULL,
    "chain_id" VARCHAR(256) NOT NULL,
    "rang" INTEGER NOT NULL,
    "name" VARCHAR(256) NOT NULL,
    "pretty_name" VARCHAR(256) NOT NULL,
    "logo_url" TEXT NOT NULL,
    "coingecko_id" VARCHAR(64) NOT NULL,
    "twitter_url" VARCHAR(256) NOT NULL,
    "docs" TEXT,
    "github_url" TEXT NOT NULL,
    "github_main_repo" TEXT NOT NULL,
    "has_validators" BOOLEAN NOT NULL DEFAULT true,
    "wallets_amount" INTEGER,
    "proposals_total" INTEGER NOT NULL DEFAULT 0,
    "proposals_live" INTEGER NOT NULL DEFAULT 0,
    "proposals_passed" INTEGER NOT NULL DEFAULT 0,
    "uptime_height" INTEGER NOT NULL DEFAULT 0,
    "last_uptime_updated" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "avg_tx_interval" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "chains_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chain_nodes" (
    "id" SERIAL NOT NULL,
    "type" VARCHAR(256) NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "chain_nodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ecosystems" (
    "name" VARCHAR(256) NOT NULL,
    "pretty_name" VARCHAR(256) NOT NULL,
    "logo_url" VARCHAR(256) NOT NULL,
    "tvl" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ecosystems_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "nodes" (
    "id" SERIAL NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "validator_id" INTEGER,
    "operator_address" VARCHAR(256) NOT NULL,
    "consensus_pubkey" VARCHAR(256) NOT NULL,
    "jailed" BOOLEAN NOT NULL DEFAULT false,
    "tokens" VARCHAR(256) NOT NULL,
    "delegator_shares" VARCHAR(256) NOT NULL,
    "moniker" TEXT NOT NULL,
    "identity" TEXT NOT NULL,
    "website" TEXT NOT NULL,
    "security_contact" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "unbonding_height" VARCHAR(256) NOT NULL,
    "unbonding_time" TIMESTAMPTZ(6) NOT NULL,
    "update_time" TIMESTAMPTZ(6) NOT NULL,
    "rate" VARCHAR(256) NOT NULL,
    "max_rate" VARCHAR(256) NOT NULL,
    "max_change_rate" VARCHAR(256) NOT NULL,
    "min_self_delegation" VARCHAR(256) NOT NULL,
    "missed_blocks" INTEGER,
    "outstanding_rewards" TEXT,
    "consensus_address" TEXT NOT NULL DEFAULT '',
    "uptime" DOUBLE PRECISION,

    CONSTRAINT "nodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prices" (
    "id" SERIAL NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "value" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tokenomics" (
    "id" SERIAL NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "ath" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "atl" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "changes_per_day" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "changes_per_month" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "changes_per_year" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "community_pool" TEXT NOT NULL DEFAULT '',
    "inflation" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "active_set_min_amount" TEXT NOT NULL DEFAULT '',
    "rewards_to_payout" TEXT NOT NULL DEFAULT '',
    "fees_revenue" TEXT NOT NULL DEFAULT '',
    "circulating_tokens_public" TEXT NOT NULL DEFAULT '',
    "total_supply" TEXT NOT NULL DEFAULT '',
    "bonded_tokens" TEXT NOT NULL DEFAULT '',
    "not_bonded_tokens" TEXT NOT NULL DEFAULT '',
    "unbonded_tokens_ratio" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tvl" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tvs" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "apr" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "circulating_tokens_onchain" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "tokenomics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposals" (
    "id" SERIAL NOT NULL,
    "type" VARCHAR(256) NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "proposal_id" TEXT NOT NULL,
    "status" "ProposalStatus" NOT NULL DEFAULT 'PROPOSAL_STATUS_UNSPECIFIED',
    "submit_time" TIMESTAMPTZ(6) NOT NULL,
    "deposit_end_time" TIMESTAMPTZ(6),
    "voting_start_time" TIMESTAMPTZ(6),
    "voting_end_time" TIMESTAMPTZ(6),
    "tally_result" JSONB,
    "final_tally_result" JSONB,
    "content" JSONB NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "validators" (
    "id" SERIAL NOT NULL,
    "identity" TEXT NOT NULL,
    "keybase_name" TEXT,
    "moniker" TEXT NOT NULL,
    "details" TEXT,
    "website" TEXT,
    "github" TEXT,
    "telegram" TEXT,
    "discord" TEXT,
    "twitter" TEXT,
    "security_contact" TEXT,
    "url" TEXT,
    "wrong_key" BOOLEAN NOT NULL DEFAULT false,
    "chain_id" INTEGER,

    CONSTRAINT "validators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "node_votes" (
    "id" SERIAL NOT NULL,
    "node_id" INTEGER NOT NULL,
    "proposal_id" INTEGER NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "vote" "VoteOption" NOT NULL DEFAULT 'UNSPECIFIED',
    "tx_hash" VARCHAR(256),

    CONSTRAINT "node_votes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_username_key" ON "accounts"("username");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_main_address_key" ON "accounts"("main_address");

-- CreateIndex
CREATE UNIQUE INDEX "addresses_main_address_key" ON "addresses"("main_address");

-- CreateIndex
CREATE UNIQUE INDEX "chain_params_chain_id_key" ON "chain_params"("chain_id");

-- CreateIndex
CREATE UNIQUE INDEX "chains_chain_id_key" ON "chains"("chain_id");

-- CreateIndex
CREATE UNIQUE INDEX "nodes_operator_address_key" ON "nodes"("operator_address");

-- CreateIndex
CREATE UNIQUE INDEX "tokenomics_chain_id_key" ON "tokenomics"("chain_id");

-- CreateIndex
CREATE UNIQUE INDEX "proposal_chain_id_proposal_id" ON "proposals"("chain_id", "proposal_id");

-- CreateIndex
CREATE UNIQUE INDEX "validators_identity_key" ON "validators"("identity");

-- CreateIndex
CREATE UNIQUE INDEX "node_id_proposal_id" ON "node_votes"("node_id", "proposal_id");

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "chains"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_main_address_fkey" FOREIGN KEY ("main_address") REFERENCES "accounts"("main_address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aprs" ADD CONSTRAINT "aprs_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "chains"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chain_params" ADD CONSTRAINT "chain_params_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "chains"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chains" ADD CONSTRAINT "chains_ecosystem_fkey" FOREIGN KEY ("ecosystem") REFERENCES "ecosystems"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chain_nodes" ADD CONSTRAINT "chain_nodes_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "chains"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nodes" ADD CONSTRAINT "nodes_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "chains"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nodes" ADD CONSTRAINT "nodes_validator_id_fkey" FOREIGN KEY ("validator_id") REFERENCES "validators"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prices" ADD CONSTRAINT "prices_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "chains"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tokenomics" ADD CONSTRAINT "tokenomics_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "chains"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "chains"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "validators" ADD CONSTRAINT "validators_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "chains"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "node_votes" ADD CONSTRAINT "node_votes_node_id_fkey" FOREIGN KEY ("node_id") REFERENCES "nodes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "node_votes" ADD CONSTRAINT "node_votes_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "proposals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "node_votes" ADD CONSTRAINT "node_votes_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "chains"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
