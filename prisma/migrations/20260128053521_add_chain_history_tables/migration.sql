-- CreateTable
CREATE TABLE "chain_tvs_history" (
    "id" SERIAL NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "tvs" DOUBLE PRECISION NOT NULL,
    "total_staked" TEXT NOT NULL,
    "total_supply" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chain_tvs_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chain_apr_history" (
    "id" SERIAL NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "apr" DOUBLE PRECISION NOT NULL,
    "blocks_count" INTEGER,
    "rewards" TEXT NOT NULL,
    "total_staked" TEXT NOT NULL,
    "avg_commission" DOUBLE PRECISION,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chain_apr_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "chain_tvs_history_chain_id_idx" ON "chain_tvs_history"("chain_id");

-- CreateIndex
CREATE UNIQUE INDEX "chain_tvs_history_chain_id_date_key" ON "chain_tvs_history"("chain_id", "date");

-- CreateIndex
CREATE INDEX "chain_apr_history_chain_id_idx" ON "chain_apr_history"("chain_id");

-- CreateIndex
CREATE UNIQUE INDEX "chain_apr_history_chain_id_date_key" ON "chain_apr_history"("chain_id", "date");

-- AddForeignKey
ALTER TABLE "chain_tvs_history" ADD CONSTRAINT "chain_tvs_history_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "chains"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chain_apr_history" ADD CONSTRAINT "chain_apr_history_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "chains"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
