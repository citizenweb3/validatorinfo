-- CreateTable
CREATE TABLE "chain_tx_metrics" (
    "id" SERIAL NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "total_txs" BIGINT,
    "txs_last_24h" INTEGER,
    "txs_30d" INTEGER,
    "tps" DOUBLE PRECISION,
    "avg_fee" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chain_tx_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "chain_tx_metrics_chain_id_key" ON "chain_tx_metrics"("chain_id");

-- AddForeignKey
ALTER TABLE "chain_tx_metrics" ADD CONSTRAINT "chain_tx_metrics_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "chains"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
