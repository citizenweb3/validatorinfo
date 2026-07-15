-- AlterTable
ALTER TABLE "github_repositories"
ADD COLUMN "author_coverage_from" DATE,
ADD COLUMN "activity_fetched_through" DATE;

-- AlterTable
ALTER TABLE "github_activities"
ADD COLUMN "author_logins" JSONB;

-- CreateTable
CREATE TABLE "github_dev_health" (
    "chain_id" INTEGER NOT NULL,
    "open_prs_count" INTEGER NOT NULL,
    "open_issues_count" INTEGER NOT NULL,
    "issues_updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "github_dev_health_pkey" PRIMARY KEY ("chain_id")
);

-- AddForeignKey
ALTER TABLE "github_dev_health"
ADD CONSTRAINT "github_dev_health_chain_id_fkey"
FOREIGN KEY ("chain_id") REFERENCES "chains"("id") ON DELETE CASCADE ON UPDATE CASCADE;
