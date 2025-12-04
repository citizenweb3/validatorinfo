-- AlterTable
ALTER TABLE "chains" ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
