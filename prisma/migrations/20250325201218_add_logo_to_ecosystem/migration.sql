/*
  Warnings:

  - Added the required column `logo_url` to the `ecosystems` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ecosystems" ADD COLUMN     "logo_url" VARCHAR(256) NOT NULL;
