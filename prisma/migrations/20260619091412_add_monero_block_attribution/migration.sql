-- CreateTable
CREATE TABLE "monero_block_attribution" (
    "id" SERIAL NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "block_hash" TEXT NOT NULL,
    "pool_id" INTEGER NOT NULL,
    "source" VARCHAR(32) NOT NULL,
    "block_timestamp" TIMESTAMPTZ(6) NOT NULL,
    "pool_reported_at" TIMESTAMPTZ(6),
    "is_canonical" BOOLEAN NOT NULL DEFAULT true,
    "is_conflicted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "monero_block_attribution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "monero_block_attribution_chain_id_block_timestamp_idx" ON "monero_block_attribution"("chain_id", "block_timestamp");

-- CreateIndex
CREATE INDEX "monero_block_attribution_chain_id_pool_id_block_timestamp_idx" ON "monero_block_attribution"("chain_id", "pool_id", "block_timestamp");

-- CreateIndex
CREATE INDEX "monero_block_attribution_chain_id_is_canonical_is_conflicte_idx" ON "monero_block_attribution"("chain_id", "is_canonical", "is_conflicted", "block_timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "monero_block_attribution_chain_id_block_hash_key" ON "monero_block_attribution"("chain_id", "block_hash");

-- AddForeignKey
ALTER TABLE "monero_block_attribution" ADD CONSTRAINT "monero_block_attribution_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "chains"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monero_block_attribution" ADD CONSTRAINT "monero_block_attribution_pool_id_fkey" FOREIGN KEY ("pool_id") REFERENCES "mining_pools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

