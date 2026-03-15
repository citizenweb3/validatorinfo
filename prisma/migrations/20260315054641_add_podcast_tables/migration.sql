-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- CreateTable
CREATE TABLE "podcast_episodes" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "publication_date" TEXT,
    "duration" TEXT,
    "episode_url" TEXT NOT NULL,
    "player_url" TEXT,
    "guest_name" TEXT NOT NULL,
    "speaker_label" TEXT,
    "summary" TEXT,
    "chain_name" TEXT,
    "identity" TEXT,
    "moniker" TEXT,
    "primary_project" TEXT,
    "mentioned_entities" TEXT[],
    "chain_id" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "podcast_episodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "podcast_chunks" (
    "id" SERIAL NOT NULL,
    "episode_id" INTEGER NOT NULL,
    "speaker_role" TEXT NOT NULL,
    "speaker_name" TEXT,
    "question" TEXT,
    "content" TEXT NOT NULL,
    "context_prefix" TEXT,
    "chunk_index" INTEGER NOT NULL,
    "embedding" vector(768) NOT NULL,
    "embedding_model" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "podcast_chunks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "podcast_episodes_slug_key" ON "podcast_episodes"("slug");

-- CreateIndex
CREATE INDEX "podcast_episodes_chain_id_idx" ON "podcast_episodes"("chain_id");

-- CreateIndex
CREATE INDEX "podcast_episodes_identity_idx" ON "podcast_episodes"("identity");

-- CreateIndex
CREATE INDEX "podcast_episodes_moniker_idx" ON "podcast_episodes"("moniker");

-- CreateIndex
CREATE INDEX "podcast_episodes_primary_project_idx" ON "podcast_episodes"("primary_project");

-- CreateIndex
CREATE INDEX "podcast_episodes_mentioned_entities_idx" ON "podcast_episodes" USING GIN ("mentioned_entities");

-- CreateIndex
CREATE INDEX "podcast_chunks_episode_id_idx" ON "podcast_chunks"("episode_id");

-- CreateIndex
CREATE INDEX "validators_moniker_idx" ON "validators"("moniker");

-- AddForeignKey
ALTER TABLE "podcast_episodes" ADD CONSTRAINT "podcast_episodes_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "chains"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "podcast_chunks" ADD CONSTRAINT "podcast_chunks_episode_id_fkey" FOREIGN KEY ("episode_id") REFERENCES "podcast_episodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- HNSW index for vector similarity search (m=16 for <100K vectors, ef_construction=128 for recall)
CREATE INDEX podcast_chunks_embedding_idx
ON podcast_chunks USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 128);
