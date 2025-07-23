/*
  Warnings:

  - You are about to drop the column `apr` on the `chains` table. All the data in the column will be lost.
  - You are about to drop the column `bonded_tokens` on the `chains` table. All the data in the column will be lost.
  - You are about to drop the column `not_bonded_tokens` on the `chains` table. All the data in the column will be lost.
  - You are about to drop the column `total_supply` on the `chains` table. All the data in the column will be lost.
  - You are about to drop the column `tvl` on the `chains` table. All the data in the column will be lost.
  - You are about to drop the column `tvs` on the `chains` table. All the data in the column will be lost.
  - You are about to drop the column `unbonded_tokens_ratio` on the `chains` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "chains" DROP COLUMN "apr",
DROP COLUMN "bonded_tokens",
DROP COLUMN "not_bonded_tokens",
DROP COLUMN "total_supply",
DROP COLUMN "tvl",
DROP COLUMN "tvs",
DROP COLUMN "unbonded_tokens_ratio";

-- AlterTable
ALTER TABLE "tokenomics" ADD COLUMN     "active_set_min_amount" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "apr" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "bonded_tokens" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "community_pool" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "fees_revenue" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "inflation" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "not_bonded_tokens" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "rewards_to_payout" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "total_supply" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "tvl" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "tvs" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "unbonded_tokens_ratio" DOUBLE PRECISION NOT NULL DEFAULT 0;
