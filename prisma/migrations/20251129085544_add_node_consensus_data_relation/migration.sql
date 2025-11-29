-- AddForeignKey
ALTER TABLE "nodes_consensus_data" ADD CONSTRAINT "nodes_consensus_data_node_address_fkey" FOREIGN KEY ("node_address") REFERENCES "nodes"("operator_address") ON DELETE RESTRICT ON UPDATE CASCADE;
