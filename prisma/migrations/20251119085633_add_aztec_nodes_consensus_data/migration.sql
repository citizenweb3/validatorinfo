-- CreateTable
CREATE TABLE "nodes_consensus_data" (
    "id" SERIAL NOT NULL,
    "node_address" TEXT NOT NULL,
    "total_slots" INTEGER,
    "total_slots_proposals" INTEGER,
    "total_slots_attestations" INTEGER,
    "missed_slots_proposals" INTEGER,
    "missed_slots_attestations" INTEGER,
    "last_attestation_timestamp" TEXT,
    "last_attestation_slot" TEXT,

    CONSTRAINT "nodes_consensus_data_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "nodes_consensus_data_node_address_key" ON "nodes_consensus_data"("node_address");
