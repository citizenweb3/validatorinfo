-- AlterTable
ALTER TABLE "mining_pools"
ADD COLUMN "miners_count" INTEGER,
ADD COLUMN "miners_updated_at" TIMESTAMPTZ(6);
