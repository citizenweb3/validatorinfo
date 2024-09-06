/*
  Warnings:

  - You are about to alter the column `value` on the `Price` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.

*/
-- AlterTable
ALTER TABLE "Price" ALTER COLUMN "value" SET DATA TYPE DECIMAL(65,30);
