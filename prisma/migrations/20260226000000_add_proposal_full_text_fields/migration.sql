-- AlterTable
ALTER TABLE "proposals" ADD COLUMN "full_text" TEXT,
ADD COLUMN "metadata_url" TEXT,
ADD COLUMN "full_text_attempts" INTEGER NOT NULL DEFAULT 0;
