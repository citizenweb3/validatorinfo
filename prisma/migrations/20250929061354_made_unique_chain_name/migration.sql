/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `chains` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "chains_name_key" ON "public"."chains"("name");
