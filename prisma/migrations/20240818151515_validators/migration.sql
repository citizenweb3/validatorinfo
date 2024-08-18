/*
  Warnings:

  - Added the required column `type` to the `Chain` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Chain" ADD COLUMN     "type" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Validator" (
    "chainId" TEXT NOT NULL,
    "operator_address" TEXT NOT NULL,
    "consensus_pubkey" TEXT NOT NULL,
    "jailed" BOOLEAN NOT NULL,
    "tokens" TEXT NOT NULL,
    "delegator_shares" TEXT NOT NULL,
    "moniker" TEXT NOT NULL,
    "identity" TEXT NOT NULL,
    "website" TEXT NOT NULL,
    "security_contact" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "descriptionId" INTEGER NOT NULL,
    "unbonding_height" TEXT NOT NULL,
    "unbonding_time" TIMESTAMP(3) NOT NULL,
    "update_time" TIMESTAMP(3) NOT NULL,
    "rate" TEXT NOT NULL,
    "max_rate" TEXT NOT NULL,
    "max_change_rate" TEXT NOT NULL,
    "commissionId" INTEGER NOT NULL,
    "min_self_delegation" TEXT NOT NULL,

    CONSTRAINT "Validator_pkey" PRIMARY KEY ("operator_address")
);

-- CreateIndex
CREATE UNIQUE INDEX "Validator_consensus_pubkey_key" ON "Validator"("consensus_pubkey");

-- AddForeignKey
ALTER TABLE "Validator" ADD CONSTRAINT "Validator_chainId_fkey" FOREIGN KEY ("chainId") REFERENCES "Chain"("chainId") ON DELETE RESTRICT ON UPDATE CASCADE;
