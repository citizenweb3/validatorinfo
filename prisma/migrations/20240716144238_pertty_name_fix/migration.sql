/*
  Warnings:

  - Added the required column `prettyName` to the `Chain` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Chain" ADD COLUMN     "prettyName" TEXT NOT NULL;
