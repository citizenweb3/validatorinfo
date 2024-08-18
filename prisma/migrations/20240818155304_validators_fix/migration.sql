/*
  Warnings:

  - You are about to drop the column `commissionId` on the `Validator` table. All the data in the column will be lost.
  - You are about to drop the column `descriptionId` on the `Validator` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Validator" DROP COLUMN "commissionId",
DROP COLUMN "descriptionId";
