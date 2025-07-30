-- AlterTable
ALTER TABLE "tokenomics" ADD COLUMN     "circulating_tokens_onchain" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "circulating_tokens_public" TEXT NOT NULL DEFAULT '';
