-- AlterTable
ALTER TABLE "chains" ADD COLUMN     "downtime_jail_duration" TEXT,
ADD COLUMN     "signed_blocks_window" INTEGER;

-- AlterTable
ALTER TABLE "nodes" ADD COLUMN     "consensus_address" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "missed_blocks" INTEGER,
ADD COLUMN     "uptime" DOUBLE PRECISION;
