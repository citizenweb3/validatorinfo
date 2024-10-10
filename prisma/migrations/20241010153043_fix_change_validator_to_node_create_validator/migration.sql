/*
  Warnings:

  - The primary key for the `Validator` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `chainId` on the `Validator` table. All the data in the column will be lost.
  - You are about to drop the column `consensus_pubkey` on the `Validator` table. All the data in the column will be lost.
  - You are about to drop the column `delegator_shares` on the `Validator` table. All the data in the column will be lost.
  - You are about to drop the column `jailed` on the `Validator` table. All the data in the column will be lost.
  - You are about to drop the column `max_change_rate` on the `Validator` table. All the data in the column will be lost.
  - You are about to drop the column `max_rate` on the `Validator` table. All the data in the column will be lost.
  - You are about to drop the column `min_self_delegation` on the `Validator` table. All the data in the column will be lost.
  - You are about to drop the column `operator_address` on the `Validator` table. All the data in the column will be lost.
  - You are about to drop the column `rate` on the `Validator` table. All the data in the column will be lost.
  - You are about to drop the column `tokens` on the `Validator` table. All the data in the column will be lost.
  - You are about to drop the column `unbonding_height` on the `Validator` table. All the data in the column will be lost.
  - You are about to drop the column `unbonding_time` on the `Validator` table. All the data in the column will be lost.
  - You are about to drop the column `update_time` on the `Validator` table. All the data in the column will be lost.
  - You are about to drop the `ValidatorLogo` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `rang` to the `Chain` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Validator" DROP CONSTRAINT "Validator_chainId_fkey";

-- DropForeignKey
ALTER TABLE "Validator" DROP CONSTRAINT "Validator_identity_fkey";

-- AlterTable
ALTER TABLE "Chain" ADD COLUMN     "rang" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Validator" DROP CONSTRAINT "Validator_pkey",
DROP COLUMN "chainId",
DROP COLUMN "consensus_pubkey",
DROP COLUMN "delegator_shares",
DROP COLUMN "jailed",
DROP COLUMN "max_change_rate",
DROP COLUMN "max_rate",
DROP COLUMN "min_self_delegation",
DROP COLUMN "operator_address",
DROP COLUMN "rate",
DROP COLUMN "tokens",
DROP COLUMN "unbonding_height",
DROP COLUMN "unbonding_time",
DROP COLUMN "update_time",
ADD COLUMN     "chainChainId" TEXT,
ADD COLUMN     "discord" TEXT,
ADD COLUMN     "github" TEXT,
ADD COLUMN     "telegram" TEXT,
ADD COLUMN     "twitter" TEXT,
ADD COLUMN     "url" TEXT,
ALTER COLUMN "website" DROP NOT NULL,
ALTER COLUMN "security_contact" DROP NOT NULL,
ALTER COLUMN "details" DROP NOT NULL,
ADD CONSTRAINT "Validator_pkey" PRIMARY KEY ("identity");

-- DropTable
DROP TABLE "ValidatorLogo";

-- CreateTable
CREATE TABLE "Node" (
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
    "unbonding_height" TEXT NOT NULL,
    "unbonding_time" TIMESTAMP(3) NOT NULL,
    "update_time" TIMESTAMP(3) NOT NULL,
    "rate" TEXT NOT NULL,
    "max_rate" TEXT NOT NULL,
    "max_change_rate" TEXT NOT NULL,
    "min_self_delegation" TEXT NOT NULL,

    CONSTRAINT "Node_pkey" PRIMARY KEY ("operator_address")
);

-- AddForeignKey
ALTER TABLE "Node" ADD CONSTRAINT "Node_chainId_fkey" FOREIGN KEY ("chainId") REFERENCES "Chain"("chainId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Node" ADD CONSTRAINT "Node_identity_fkey" FOREIGN KEY ("identity") REFERENCES "Validator"("identity") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Validator" ADD CONSTRAINT "Validator_chainChainId_fkey" FOREIGN KEY ("chainChainId") REFERENCES "Chain"("chainId") ON DELETE SET NULL ON UPDATE CASCADE;
