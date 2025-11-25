-- AlterTable
ALTER TABLE "aztec_attester_events" ADD COLUMN     "provider_address" VARCHAR(256);

-- CreateIndex
CREATE INDEX "aztec_attester_event_chain_provider_idx" ON "aztec_attester_events"("chain_id", "provider_address");
