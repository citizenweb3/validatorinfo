-- CreateTable
CREATE TABLE "price_history" (
    "id" SERIAL NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "value" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "date" DATE NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "price_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "price_history_chain_id_date_key" ON "price_history"("chain_id", "date");

-- AddForeignKey
ALTER TABLE "price_history" ADD CONSTRAINT "price_history_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "chains"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
