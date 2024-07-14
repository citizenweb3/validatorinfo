-- CreateTable
CREATE TABLE "WsNode" (
    "chainId" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "WsNode_pkey" PRIMARY KEY ("chainId","url")
);

-- AddForeignKey
ALTER TABLE "WsNode" ADD CONSTRAINT "WsNode_chainId_fkey" FOREIGN KEY ("chainId") REFERENCES "Chain"("chainId") ON DELETE RESTRICT ON UPDATE CASCADE;
