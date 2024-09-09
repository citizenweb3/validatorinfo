-- CreateTable
CREATE TABLE "Apr" (
    "chainId" TEXT NOT NULL,
    "id" SERIAL NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Apr_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ValidatorLogo" (
    "identity" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "ValidatorLogo_pkey" PRIMARY KEY ("identity")
);

-- AddForeignKey
ALTER TABLE "Validator" ADD CONSTRAINT "Validator_identity_fkey" FOREIGN KEY ("identity") REFERENCES "ValidatorLogo"("identity") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Apr" ADD CONSTRAINT "Apr_chainId_fkey" FOREIGN KEY ("chainId") REFERENCES "Chain"("chainId") ON DELETE RESTRICT ON UPDATE CASCADE;
