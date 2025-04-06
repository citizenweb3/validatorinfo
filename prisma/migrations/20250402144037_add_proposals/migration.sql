-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('PROPOSAL_STATUS_UNSPECIFIED', 'PROPOSAL_STATUS_DEPOSIT_PERIOD', 'PROPOSAL_STATUS_VOTING_PERIOD', 'PROPOSAL_STATUS_PASSED', 'PROPOSAL_STATUS_REJECTED', 'PROPOSAL_STATUS_FAILED');

-- AlterTable
ALTER TABLE "chains" ADD COLUMN     "proposals_live" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "proposals_passed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "proposals_total" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "tvs" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "proposals" (
    "id" SERIAL NOT NULL,
    "type" VARCHAR(256) NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "proposal_id" TEXT NOT NULL,
    "status" "ProposalStatus" NOT NULL DEFAULT 'PROPOSAL_STATUS_UNSPECIFIED',
    "submit_time" TIMESTAMPTZ(6) NOT NULL,
    "deposit_end_time" TIMESTAMPTZ(6) NOT NULL,
    "voting_start_time" TIMESTAMPTZ(6) NOT NULL,
    "voting_end_time" TIMESTAMPTZ(6) NOT NULL,
    "tally_result" JSONB,
    "final_tally_result" JSONB,
    "content" JSONB NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proposals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "proposal_chain_id_proposal_id" ON "proposals"("chain_id", "proposal_id");

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "chains"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
