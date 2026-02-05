-- CreateTable
CREATE TABLE "chain_validators_history" (
    "id" SERIAL NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "validators_count" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chain_validators_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "chain_validators_history_chain_id_idx" ON "chain_validators_history"("chain_id");

-- CreateIndex
CREATE UNIQUE INDEX "chain_validators_history_chain_id_date_key" ON "chain_validators_history"("chain_id", "date");

-- AddForeignKey
ALTER TABLE "chain_validators_history" ADD CONSTRAINT "chain_validators_history_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "chains"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
