-- AlterTable
ALTER TABLE "chain_params" ADD COLUMN     "hard_fork_timeline_json" JSONB;

-- AlterTable
ALTER TABLE "chains" ADD COLUMN     "consensus_type" VARCHAR(32),
ADD COLUMN     "hashrate_unit" VARCHAR(16);

-- CreateTable
CREATE TABLE "mining_pools" (
    "id" SERIAL NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "slug" VARCHAR(256) NOT NULL,
    "name" VARCHAR(256) NOT NULL,
    "logo_url" TEXT,
    "website" TEXT,
    "payment_scheme" VARCHAR(64),
    "fee_percent" DOUBLE PRECISION,
    "identification_method" VARCHAR(64) NOT NULL,
    "detector_json" JSONB,
    "fingerprint" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "mining_pools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mining_pool_stats" (
    "id" SERIAL NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "pool_id" INTEGER NOT NULL,
    "window_kind" VARCHAR(16) NOT NULL,
    "blocks_found" INTEGER NOT NULL,
    "share_percent" DOUBLE PRECISION NOT NULL,
    "hashrate_estimate" TEXT NOT NULL,
    "window_start" TIMESTAMPTZ(6) NOT NULL,
    "window_end" TIMESTAMPTZ(6) NOT NULL,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "mining_pool_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chain_hashrate_snapshots" (
    "id" SERIAL NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "snapshot_at" TIMESTAMPTZ(6) NOT NULL,
    "height" INTEGER NOT NULL,
    "hashrate" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,

    CONSTRAINT "chain_hashrate_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "mining_pools_chain_id_fingerprint_idx" ON "mining_pools"("chain_id", "fingerprint");

-- CreateIndex
CREATE UNIQUE INDEX "mining_pools_chain_id_slug_key" ON "mining_pools"("chain_id", "slug");

-- CreateIndex
CREATE INDEX "mining_pool_stats_chain_id_window_kind_share_percent_idx" ON "mining_pool_stats"("chain_id", "window_kind", "share_percent");

-- CreateIndex
CREATE UNIQUE INDEX "mining_pool_stats_chain_id_pool_id_window_kind_key" ON "mining_pool_stats"("chain_id", "pool_id", "window_kind");

-- CreateIndex
CREATE INDEX "chain_hashrate_snapshots_chain_id_height_idx" ON "chain_hashrate_snapshots"("chain_id", "height");

-- CreateIndex
CREATE UNIQUE INDEX "chain_hashrate_snapshots_chain_id_snapshot_at_key" ON "chain_hashrate_snapshots"("chain_id", "snapshot_at");

-- AddForeignKey
ALTER TABLE "mining_pools" ADD CONSTRAINT "mining_pools_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "chains"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mining_pool_stats" ADD CONSTRAINT "mining_pool_stats_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "chains"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mining_pool_stats" ADD CONSTRAINT "mining_pool_stats_pool_id_fkey" FOREIGN KEY ("pool_id") REFERENCES "mining_pools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chain_hashrate_snapshots" ADD CONSTRAINT "chain_hashrate_snapshots_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "chains"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
