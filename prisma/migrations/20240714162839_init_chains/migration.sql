-- CreateTable
CREATE TABLE "Chain" (
    "chainId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "coinType" INTEGER NOT NULL,
    "denom" TEXT NOT NULL,
    "minimalDenom" TEXT NOT NULL,
    "coinDecimals" INTEGER NOT NULL,
    "logoUrl" TEXT NOT NULL,
    "walletUrlForStaking" TEXT NOT NULL,
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

-- AddForeignKey
ALTER TABLE "Github" ADD CONSTRAINT "Github_chainId_fkey" FOREIGN KEY ("chainId") REFERENCES "Chain"("chainId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RpcNode" ADD CONSTRAINT "RpcNode_chainId_fkey" FOREIGN KEY ("chainId") REFERENCES "Chain"("chainId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LcdNode" ADD CONSTRAINT "LcdNode_chainId_fkey" FOREIGN KEY ("chainId") REFERENCES "Chain"("chainId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrpcNode" ADD CONSTRAINT "GrpcNode_chainId_fkey" FOREIGN KEY ("chainId") REFERENCES "Chain"("chainId") ON DELETE RESTRICT ON UPDATE CASCADE;
