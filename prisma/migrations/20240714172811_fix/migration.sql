/*
  Warnings:

  - You are about to drop the column `walletUrlForStaking` on the `Chain` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Chain" DROP COLUMN "walletUrlForStaking";
