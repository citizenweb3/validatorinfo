-- CreateTable
CREATE TABLE "ecosystems" (
    "name" VARCHAR(256) NOT NULL,
    "pretty_name" VARCHAR(256) NOT NULL,
    "tvl" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ecosystems_pkey" PRIMARY KEY ("name")
);

-- AddForeignKey
ALTER TABLE "chains" ADD CONSTRAINT "chains_ecosystem_fkey" FOREIGN KEY ("ecosystem") REFERENCES "ecosystems"("name") ON DELETE RESTRICT ON UPDATE CASCADE;
