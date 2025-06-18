-- CreateTable
CREATE TABLE "tokenomics" (
    "id" SERIAL NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "ath" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "atl" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "changes_per_day" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "changes_per_month" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "changes_per_year" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "tokenomics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tokenomics_chain_id_key" ON "tokenomics"("chain_id");

-- AddForeignKey
ALTER TABLE "tokenomics" ADD CONSTRAINT "tokenomics_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "chains"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
