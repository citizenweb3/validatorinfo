-- AlterTable
ALTER TABLE "chains" ALTER COLUMN "bonded_tokens" SET DEFAULT '',
ALTER COLUMN "bonded_tokens" SET DATA TYPE TEXT,
ALTER COLUMN "not_bonded_tokens" SET DEFAULT '',
ALTER COLUMN "not_bonded_tokens" SET DATA TYPE TEXT,
ALTER COLUMN "total_supply" SET DEFAULT '',
ALTER COLUMN "total_supply" SET DATA TYPE TEXT;
