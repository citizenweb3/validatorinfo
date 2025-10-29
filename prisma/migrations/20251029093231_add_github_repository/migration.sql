-- CreateTable
CREATE TABLE "github_repositories" (
    "id" SERIAL NOT NULL,
    "chain_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "homepage" TEXT,
    "language" TEXT,
    "stars_count" INTEGER NOT NULL DEFAULT 0,
    "forks_count" INTEGER NOT NULL DEFAULT 0,
    "watchers_count" INTEGER NOT NULL DEFAULT 0,
    "open_issues_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "pushed_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "github_repositories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "github_activities" (
    "id" SERIAL NOT NULL,
    "repository_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "commit_count" INTEGER NOT NULL DEFAULT 0,
    "additions" INTEGER NOT NULL DEFAULT 0,
    "deletions" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "github_activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "github_repositories_chain_id_full_name_key" ON "github_repositories"("chain_id", "full_name");

-- CreateIndex
CREATE UNIQUE INDEX "repository_id_date" ON "github_activities"("repository_id", "date");

-- AddForeignKey
ALTER TABLE "github_repositories" ADD CONSTRAINT "github_repositories_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "chains"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "github_activities" ADD CONSTRAINT "github_activities_repository_id_fkey" FOREIGN KEY ("repository_id") REFERENCES "github_repositories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
