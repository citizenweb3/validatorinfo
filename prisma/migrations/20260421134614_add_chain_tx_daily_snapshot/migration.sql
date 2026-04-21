-- CreateTable
CREATE TABLE "chain_tx_daily_snapshots" (
    "id" SERIAL NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "snapshot_at" DATE NOT NULL,
    "total_txs" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chain_tx_daily_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "chain_tx_daily_snapshots_chain_id_snapshot_at_idx" ON "chain_tx_daily_snapshots"("chain_id", "snapshot_at");

-- CreateIndex
CREATE UNIQUE INDEX "chain_tx_daily_snapshots_chain_id_snapshot_at_key" ON "chain_tx_daily_snapshots"("chain_id", "snapshot_at");

-- AddForeignKey
ALTER TABLE "chain_tx_daily_snapshots" ADD CONSTRAINT "chain_tx_daily_snapshots_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "chains"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
