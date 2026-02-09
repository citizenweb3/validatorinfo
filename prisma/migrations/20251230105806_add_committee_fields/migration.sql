-- AlterTable
ALTER TABLE "nodes" ADD COLUMN     "committee_epoch" BIGINT,
ADD COLUMN     "in_committee" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "nodes_chain_id_in_committee_idx" ON "nodes"("chain_id", "in_committee");
