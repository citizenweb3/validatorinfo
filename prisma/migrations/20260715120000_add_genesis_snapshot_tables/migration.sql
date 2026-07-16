-- CreateTable
CREATE TABLE "genesis_snapshots" (
    "id" SERIAL NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "source_url" TEXT NOT NULL,
    "sha256" CHAR(64) NOT NULL,
    "meta" JSONB NOT NULL,
    "initial_height" BIGINT NOT NULL,
    "boundary_height" BIGINT NOT NULL,
    "boundary_time" TIMESTAMPTZ(6) NOT NULL,
    "account_count" INTEGER NOT NULL DEFAULT 0,
    "delegation_count" INTEGER NOT NULL DEFAULT 0,
    "status" VARCHAR(16) NOT NULL DEFAULT 'importing',
    "ready_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "genesis_snapshots_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "genesis_snapshots_sha256_check" CHECK ("sha256" ~ '^[0-9a-f]{64}$'),
    CONSTRAINT "genesis_snapshots_heights_check" CHECK ("initial_height" > 0 AND "boundary_height" > 0),
    CONSTRAINT "genesis_snapshots_counts_check" CHECK ("account_count" >= 0 AND "delegation_count" >= 0),
    CONSTRAINT "genesis_snapshots_status_check" CHECK ("status" IN ('importing', 'ready')),
    CONSTRAINT "genesis_snapshots_ready_at_check" CHECK (
        ("status" = 'importing' AND "ready_at" IS NULL)
        OR ("status" = 'ready' AND "ready_at" IS NOT NULL)
    )
);

-- CreateTable
CREATE TABLE "genesis_accounts" (
    "id" SERIAL NOT NULL,
    "snapshot_id" INTEGER NOT NULL,
    "address" VARCHAR(128) NOT NULL,

    CONSTRAINT "genesis_accounts_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "genesis_accounts_address_check" CHECK (length("address") > 0)
);

-- CreateTable
CREATE TABLE "genesis_delegations" (
    "id" SERIAL NOT NULL,
    "snapshot_id" INTEGER NOT NULL,
    "delegator_address" VARCHAR(128) NOT NULL,
    "validator_address" VARCHAR(128) NOT NULL,
    "denom" VARCHAR(128) NOT NULL,
    "amount" DECIMAL(80,0) NOT NULL,

    CONSTRAINT "genesis_delegations_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "genesis_delegations_identity_check" CHECK (
        length("delegator_address") > 0
        AND length("validator_address") > 0
        AND length("denom") > 0
    ),
    CONSTRAINT "genesis_delegations_amount_check" CHECK ("amount" > 0)
);

-- CreateIndex
CREATE UNIQUE INDEX "genesis_snapshots_chain_id_key" ON "genesis_snapshots"("chain_id");

-- CreateIndex
CREATE UNIQUE INDEX "genesis_accounts_snapshot_id_address_key" ON "genesis_accounts"("snapshot_id", "address");

-- CreateIndex
CREATE UNIQUE INDEX "genesis_delegations_snapshot_validator_denom_key"
ON "genesis_delegations"("snapshot_id", "delegator_address", "validator_address", "denom");

-- CreateIndex
CREATE INDEX "genesis_delegations_snapshot_delegator_idx"
ON "genesis_delegations"("snapshot_id", "delegator_address");

-- AddForeignKey
ALTER TABLE "genesis_snapshots" ADD CONSTRAINT "genesis_snapshots_chain_id_fkey"
FOREIGN KEY ("chain_id") REFERENCES "chains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "genesis_accounts" ADD CONSTRAINT "genesis_accounts_snapshot_id_fkey"
FOREIGN KEY ("snapshot_id") REFERENCES "genesis_snapshots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "genesis_delegations" ADD CONSTRAINT "genesis_delegations_snapshot_id_fkey"
FOREIGN KEY ("snapshot_id") REFERENCES "genesis_snapshots"("id") ON DELETE CASCADE ON UPDATE CASCADE;
