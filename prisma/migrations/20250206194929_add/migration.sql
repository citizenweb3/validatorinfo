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
CREATE TABLE "chain_nodes" (
    "id" SERIAL NOT NULL,
    "type" VARCHAR(256) NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "chain_nodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chains" (
    "id" SERIAL NOT NULL,
    "ecosystem" VARCHAR(256) NOT NULL,
    "chain_id" VARCHAR(256) NOT NULL,
    "rang" INTEGER NOT NULL,
    "name" VARCHAR(256) NOT NULL,
    "pretty_name" VARCHAR(256) NOT NULL,
    "coin_type" INTEGER NOT NULL,
    "denom" VARCHAR(256) NOT NULL,
    "minimal_denom" VARCHAR(256) NOT NULL,
    "coin_decimals" INTEGER NOT NULL,
    "logo_url" TEXT NOT NULL,
    "coingecko_id" VARCHAR(64) NOT NULL,
    "bech32_prefix" VARCHAR(32) NOT NULL,
    "twitter_url" VARCHAR(256) NOT NULL,
    "docs" TEXT,
    "github_url" TEXT NOT NULL,
    "github_main_repo" TEXT NOT NULL,
    "has_validators" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "chains_pkey" PRIMARY KEY ("id")
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

-- CreateIndex
CREATE UNIQUE INDEX "accounts_username_key" ON "accounts"("username");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_main_address_key" ON "accounts"("main_address");

-- CreateIndex
CREATE UNIQUE INDEX "addresses_main_address_key" ON "addresses"("main_address");

-- CreateIndex
CREATE UNIQUE INDEX "chains_chain_id_key" ON "chains"("chain_id");

-- CreateIndex
CREATE UNIQUE INDEX "nodes_operator_address_key" ON "nodes"("operator_address");

-- CreateIndex
CREATE UNIQUE INDEX "validators_identity_key" ON "validators"("identity");

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "chains"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_main_address_fkey" FOREIGN KEY ("main_address") REFERENCES "accounts"("main_address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aprs" ADD CONSTRAINT "aprs_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "chains"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chain_nodes" ADD CONSTRAINT "chain_nodes_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "chains"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nodes" ADD CONSTRAINT "nodes_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "chains"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nodes" ADD CONSTRAINT "nodes_validator_id_fkey" FOREIGN KEY ("validator_id") REFERENCES "validators"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prices" ADD CONSTRAINT "prices_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "chains"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "validators" ADD CONSTRAINT "validators_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "chains"("id") ON DELETE SET NULL ON UPDATE CASCADE;
