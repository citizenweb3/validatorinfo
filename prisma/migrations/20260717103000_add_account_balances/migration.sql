-- CreateTable
CREATE TABLE "account_balances" (
    "id" SERIAL NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "address" VARCHAR(128) NOT NULL,
    "denom" VARCHAR(128) NOT NULL,
    "liquid" DECIMAL(80,0) NOT NULL DEFAULT 0,
    "staked" DECIMAL(80,0) NOT NULL DEFAULT 0,
    "unbonding" DECIMAL(80,0) NOT NULL DEFAULT 0,
    "rewards" DECIMAL(80,0) NOT NULL DEFAULT 0,
    "last_viewed_at" TIMESTAMPTZ(6) NOT NULL,
    "updated_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "account_balances_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "account_balances_identity_check" CHECK (length("address") > 0 AND length("denom") > 0),
    CONSTRAINT "account_balances_amounts_check" CHECK (
        "liquid" >= 0
        AND "staked" >= 0
        AND "unbonding" >= 0
        AND "rewards" >= 0
    )
);

-- CreateIndex
CREATE UNIQUE INDEX "account_balances_chain_id_address_key"
ON "account_balances"("chain_id", "address");

-- CreateIndex
CREATE INDEX "account_balances_chain_id_last_viewed_at_updated_at_idx"
ON "account_balances"("chain_id", "last_viewed_at", "updated_at");

-- AddForeignKey
ALTER TABLE "account_balances" ADD CONSTRAINT "account_balances_chain_id_fkey"
FOREIGN KEY ("chain_id") REFERENCES "chains"("id") ON DELETE CASCADE ON UPDATE CASCADE;
