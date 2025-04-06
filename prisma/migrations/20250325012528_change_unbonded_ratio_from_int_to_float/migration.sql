-- AlterTable
ALTER TABLE "chains" ALTER COLUMN "unbonded_tokens_ratio" SET DEFAULT 0,
ALTER COLUMN "unbonded_tokens_ratio" SET DATA TYPE DOUBLE PRECISION;
