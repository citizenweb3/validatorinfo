-- CreateTable
CREATE TABLE "monero_pool_daily_shares" (
    "id" SERIAL NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "pool_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "blocks_found" INTEGER NOT NULL,
    "share_percent" DOUBLE PRECISION NOT NULL,
    "network_blocks" INTEGER NOT NULL,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "monero_pool_daily_shares_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "monero_pool_daily_shares_chain_id_pool_id_date_key"
ON "monero_pool_daily_shares"("chain_id", "pool_id", "date");

-- CreateIndex
CREATE INDEX "monero_pool_daily_shares_chain_id_date_idx"
ON "monero_pool_daily_shares"("chain_id", "date");

-- AddForeignKey
ALTER TABLE "monero_pool_daily_shares"
ADD CONSTRAINT "monero_pool_daily_shares_chain_id_fkey"
FOREIGN KEY ("chain_id") REFERENCES "chains"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monero_pool_daily_shares"
ADD CONSTRAINT "monero_pool_daily_shares_pool_id_fkey"
FOREIGN KEY ("pool_id") REFERENCES "mining_pools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
