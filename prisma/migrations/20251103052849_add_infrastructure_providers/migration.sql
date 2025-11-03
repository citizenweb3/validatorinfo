-- AlterTable
ALTER TABLE "chain_nodes" ADD COLUMN     "consecutive_failures" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "last_checked_at" TIMESTAMP(3),
ADD COLUMN     "node_id" INTEGER,
ADD COLUMN     "provider" VARCHAR(256),
ADD COLUMN     "response_time" INTEGER,
ADD COLUMN     "status" VARCHAR(50) NOT NULL DEFAULT 'active';

-- AddForeignKey
ALTER TABLE "chain_nodes" ADD CONSTRAINT "chain_nodes_node_id_fkey" FOREIGN KEY ("node_id") REFERENCES "nodes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
