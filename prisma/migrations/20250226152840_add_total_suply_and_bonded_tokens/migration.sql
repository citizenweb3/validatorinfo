-- AlterTable
ALTER TABLE "chains" ADD COLUMN     "bonded_tokens" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "not_bonded_tokens" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "total_supply" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "tvl" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "unbonded_tokens_ratio" INTEGER NOT NULL DEFAULT 0;
