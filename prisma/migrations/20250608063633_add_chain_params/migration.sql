/*
  Warnings:

  - You are about to drop the column `bech32_prefix` on the `chains` table. All the data in the column will be lost.
  - You are about to drop the column `binaries` on the `chains` table. All the data in the column will be lost.
  - You are about to drop the column `coin_decimals` on the `chains` table. All the data in the column will be lost.
  - You are about to drop the column `coin_type` on the `chains` table. All the data in the column will be lost.
  - You are about to drop the column `community_tax` on the `chains` table. All the data in the column will be lost.
  - You are about to drop the column `daemon_name` on the `chains` table. All the data in the column will be lost.
  - You are about to drop the column `denom` on the `chains` table. All the data in the column will be lost.
  - You are about to drop the column `downtime_jail_duration` on the `chains` table. All the data in the column will be lost.
  - You are about to drop the column `genesis` on the `chains` table. All the data in the column will be lost.
  - You are about to drop the column `key_algos` on the `chains` table. All the data in the column will be lost.
  - You are about to drop the column `max_validators` on the `chains` table. All the data in the column will be lost.
  - You are about to drop the column `minimal_denom` on the `chains` table. All the data in the column will be lost.
  - You are about to drop the column `node_home` on the `chains` table. All the data in the column will be lost.
  - You are about to drop the column `peers` on the `chains` table. All the data in the column will be lost.
  - You are about to drop the column `seeds` on the `chains` table. All the data in the column will be lost.
  - You are about to drop the column `signed_blocks_window` on the `chains` table. All the data in the column will be lost.
  - You are about to drop the column `unbonding_time` on the `chains` table. All the data in the column will be lost.
  - You are about to drop the column `voting_period` on the `chains` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "chains" DROP COLUMN "bech32_prefix",
DROP COLUMN "binaries",
DROP COLUMN "coin_decimals",
DROP COLUMN "coin_type",
DROP COLUMN "community_tax",
DROP COLUMN "daemon_name",
DROP COLUMN "denom",
DROP COLUMN "downtime_jail_duration",
DROP COLUMN "genesis",
DROP COLUMN "key_algos",
DROP COLUMN "max_validators",
DROP COLUMN "minimal_denom",
DROP COLUMN "node_home",
DROP COLUMN "peers",
DROP COLUMN "seeds",
DROP COLUMN "signed_blocks_window",
DROP COLUMN "unbonding_time",
DROP COLUMN "voting_period";

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

-- CreateIndex
CREATE UNIQUE INDEX "chain_params_chain_id_key" ON "chain_params"("chain_id");

-- AddForeignKey
ALTER TABLE "chain_params" ADD CONSTRAINT "chain_params_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "chains"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
