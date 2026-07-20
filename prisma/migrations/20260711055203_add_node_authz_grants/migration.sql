-- CreateTable
CREATE TABLE "node_authz_grants" (
    "id" SERIAL NOT NULL,
    "node_id" INTEGER NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "granter" VARCHAR(256) NOT NULL,
    "grantee" VARCHAR(256) NOT NULL,
    "authorization_type" VARCHAR(256) NOT NULL,
    "msg_type_url" VARCHAR(256),
    "authorization_data" JSONB,
    "expiration" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "node_authz_grants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "node_authz_grants_node_id_idx" ON "node_authz_grants"("node_id");

-- AddForeignKey
ALTER TABLE "node_authz_grants" ADD CONSTRAINT "node_authz_grants_node_id_fkey" FOREIGN KEY ("node_id") REFERENCES "nodes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "node_authz_grants" ADD CONSTRAINT "node_authz_grants_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "chains"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
