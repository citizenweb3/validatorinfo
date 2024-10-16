-- CreateTable
CREATE TABLE "Chain" (
    "type" TEXT NOT NULL,
    "chainId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "prettyName" TEXT NOT NULL,
    "coinType" INTEGER NOT NULL,
    "denom" TEXT NOT NULL,
    "minimalDenom" TEXT NOT NULL,
    "coinDecimals" INTEGER NOT NULL,
    "logoUrl" TEXT NOT NULL,
    "coinGeckoId" TEXT NOT NULL,
    "bech32Prefix" TEXT NOT NULL,
    "twitterUrl" TEXT NOT NULL,
    "docs" TEXT,

    CONSTRAINT "Chain_pkey" PRIMARY KEY ("chainId")
);

-- CreateTable
CREATE TABLE "Github" (
    "chainId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mainRepo" TEXT NOT NULL,

    CONSTRAINT "Github_pkey" PRIMARY KEY ("chainId")
);

-- CreateTable
CREATE TABLE "WsNode" (
    "chainId" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "WsNode_pkey" PRIMARY KEY ("chainId","url")
);

-- CreateTable
CREATE TABLE "RpcNode" (
    "chainId" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "RpcNode_pkey" PRIMARY KEY ("chainId","url")
);

-- CreateTable
CREATE TABLE "LcdNode" (
    "chainId" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "LcdNode_pkey" PRIMARY KEY ("chainId","url")
);

-- CreateTable
CREATE TABLE "GrpcNode" (
    "chainId" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "GrpcNode_pkey" PRIMARY KEY ("chainId","url")
);

-- CreateTable
CREATE TABLE "Validator" (
    "chainId" TEXT NOT NULL,
    "operator_address" TEXT NOT NULL,
    "consensus_pubkey" TEXT NOT NULL,
    "jailed" BOOLEAN NOT NULL,
    "tokens" TEXT NOT NULL,
    "delegator_shares" TEXT NOT NULL,
    "moniker" TEXT NOT NULL,
    "identity" TEXT NOT NULL,
    "website" TEXT NOT NULL,
    "security_contact" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "unbonding_height" TEXT NOT NULL,
    "unbonding_time" TIMESTAMP(3) NOT NULL,
    "update_time" TIMESTAMP(3) NOT NULL,
    "rate" TEXT NOT NULL,
    "max_rate" TEXT NOT NULL,
    "max_change_rate" TEXT NOT NULL,
    "min_self_delegation" TEXT NOT NULL,

    CONSTRAINT "Validator_pkey" PRIMARY KEY ("operator_address")
);

-- AddForeignKey
ALTER TABLE "Github" ADD CONSTRAINT "Github_chainId_fkey" FOREIGN KEY ("chainId") REFERENCES "Chain"("chainId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WsNode" ADD CONSTRAINT "WsNode_chainId_fkey" FOREIGN KEY ("chainId") REFERENCES "Chain"("chainId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RpcNode" ADD CONSTRAINT "RpcNode_chainId_fkey" FOREIGN KEY ("chainId") REFERENCES "Chain"("chainId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LcdNode" ADD CONSTRAINT "LcdNode_chainId_fkey" FOREIGN KEY ("chainId") REFERENCES "Chain"("chainId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrpcNode" ADD CONSTRAINT "GrpcNode_chainId_fkey" FOREIGN KEY ("chainId") REFERENCES "Chain"("chainId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Validator" ADD CONSTRAINT "Validator_chainId_fkey" FOREIGN KEY ("chainId") REFERENCES "Chain"("chainId") ON DELETE RESTRICT ON UPDATE CASCADE;
