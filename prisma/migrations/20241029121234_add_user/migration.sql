-- CreateTable
CREATE TABLE "Account" (
    "username" TEXT,
    "mainAddress" TEXT NOT NULL,
    "coreTeam" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("mainAddress")
);

-- CreateTable
CREATE TABLE "Address" (
    "mainAddress" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "chainId" TEXT NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("address")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_username_key" ON "Account"("username");

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_mainAddress_fkey" FOREIGN KEY ("mainAddress") REFERENCES "Account"("mainAddress") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_chainId_fkey" FOREIGN KEY ("chainId") REFERENCES "Chain"("chainId") ON DELETE RESTRICT ON UPDATE CASCADE;
