-- CreateEnum
CREATE TYPE "VoteOption" AS ENUM ('YES', 'NO', 'ABSTAIN', 'VETO', 'UNSPECIFIED');

-- CreateTable
CREATE TABLE "node_votes" (
    "id" SERIAL NOT NULL,
    "node_id" INTEGER NOT NULL,
    "proposal_id" INTEGER NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "vote" "VoteOption" NOT NULL DEFAULT 'UNSPECIFIED',
    "tx_hash" VARCHAR(256),

    CONSTRAINT "node_votes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "node_id_proposal_id" ON "node_votes"("node_id", "proposal_id");

-- AddForeignKey
ALTER TABLE "node_votes" ADD CONSTRAINT "node_votes_node_id_fkey" FOREIGN KEY ("node_id") REFERENCES "nodes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "node_votes" ADD CONSTRAINT "node_votes_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "proposals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "node_votes" ADD CONSTRAINT "node_votes_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "chains"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
