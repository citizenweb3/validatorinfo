-- AlterTable
ALTER TABLE "proposals" ALTER COLUMN "deposit_end_time" DROP NOT NULL,
ALTER COLUMN "voting_start_time" DROP NOT NULL,
ALTER COLUMN "voting_end_time" DROP NOT NULL;
