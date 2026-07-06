-- CreateTable
CREATE TABLE "monero_block" (
    "id" SERIAL NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "block_hash" TEXT NOT NULL,
    "block_timestamp" TIMESTAMPTZ(6) NOT NULL,
    "major_version" INTEGER NOT NULL,
    "minor_version" INTEGER NOT NULL,
    "size" INTEGER NOT NULL,
    "block_weight" INTEGER NOT NULL,
    "long_term_weight" INTEGER NOT NULL,
    "tx_count" INTEGER NOT NULL,
    "reward_atomic" TEXT NOT NULL,
    "is_canonical" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "monero_block_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "monero_block_chain_id_block_timestamp_idx" ON "monero_block"("chain_id", "block_timestamp");

-- CreateIndex
CREATE INDEX "monero_block_chain_id_is_canonical_block_timestamp_idx" ON "monero_block"("chain_id", "is_canonical", "block_timestamp");

-- CreateIndex
CREATE INDEX "monero_block_chain_id_height_idx" ON "monero_block"("chain_id", "height");

-- CreateIndex
CREATE UNIQUE INDEX "monero_block_chain_id_block_hash_key" ON "monero_block"("chain_id", "block_hash");

-- AddForeignKey
ALTER TABLE "monero_block" ADD CONSTRAINT "monero_block_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "chains"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
