-- AlterTable
ALTER TABLE "ecosystems" ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
