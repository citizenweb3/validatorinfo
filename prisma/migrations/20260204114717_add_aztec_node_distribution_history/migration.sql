-- CreateTable
CREATE TABLE "aztec_node_distribution_history" (
    "id" SERIAL NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "total" INTEGER NOT NULL,
    "active" INTEGER NOT NULL,
    "in_queue" INTEGER NOT NULL,
    "zombie" INTEGER NOT NULL,
    "exiting" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aztec_node_distribution_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "aztec_node_distribution_history_chain_id_date_idx" ON "aztec_node_distribution_history"("chain_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "aztec_node_distribution_history_chain_id_date_key" ON "aztec_node_distribution_history"("chain_id", "date");

-- AddForeignKey
ALTER TABLE "aztec_node_distribution_history" ADD CONSTRAINT "aztec_node_distribution_history_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "chains"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
