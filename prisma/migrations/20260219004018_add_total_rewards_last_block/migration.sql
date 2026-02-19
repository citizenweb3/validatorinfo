-- AlterTable
ALTER TABLE "chains" ADD COLUMN     "total_rewards_last_block" TEXT;

-- AlterTable
ALTER TABLE "nodes" ADD COLUMN     "total_earned_rewards" TEXT;
