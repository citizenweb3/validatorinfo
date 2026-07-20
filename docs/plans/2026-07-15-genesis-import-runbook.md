# Genesis snapshot import runbook

This runbook covers the one-off ValidatorInfo genesis import for `cosmoshub-4` and `atomone-1`. The importer is intentionally not registered in `server/indexer.ts` or `server/task-worker.ts`; it never runs on startup or on a cron schedule.

## Safety boundary

- `verify-only` is the default mode. It downloads or copies the source into a private temporary directory, verifies its pinned hash, validates the full document, and performs no API or database access.
- `dry-run` additionally reads the ValidatorInfo `Chain` identity and the indexer `/api/v1/coverage` boundary. It performs no database writes.
- `apply` is the only mutating mode. Use it only after an explicit human authorization for the target database.
- Never run `prisma migrate dev` for this feature. Deploy only the reviewed handwritten migration.
- Never use a Prisma migration-history-to-datamodel diff as an apply source. Prisma cannot represent the hand-managed HNSW index and may incorrectly emit `DROP INDEX "podcast_chunks_embedding_idx"`.
- Stop immediately if any inspected or generated SQL mentions `podcast_chunks`, `vector`, `hnsw`, or `podcast_chunks_embedding_idx`.

No live migration or live genesis import is part of the implementation workflow that produced this runbook.

## Configuration

Select exactly one chain argument: `cosmoshub` or `atomone`.

| Variable                                               | Required in           | Meaning                                                                                    |
| ------------------------------------------------------ | --------------------- | ------------------------------------------------------------------------------------------ |
| `GENESIS_IMPORT_MODE`                                  | optional              | `verify-only` (default), `dry-run`, or `apply`                                             |
| `GENESIS_IMPORT_BATCH_SIZE`                            | optional              | Account/delegation insert batch size, integer `1..5000`, default `5000`                    |
| `COSMOSHUB_GENESIS_SOURCE`                             | Cosmos all modes      | Explicit local path, `file:` URL, or HTTP(S) URL for the pinned Cosmos Hub genesis archive |
| `ATOMONE_GENESIS_SOURCE`                               | AtomOne all modes     | Explicit local path, `file:` URL, or HTTP(S) URL for the pinned AtomOne genesis JSON       |
| `DATABASE_URL`                                         | dry-run/apply         | Target ValidatorInfo PostgreSQL URL                                                        |
| `COSMOS_INDEXER_BASE_URL` / `COSMOS_INDEXER_API_KEY`   | Cosmos dry-run/apply  | Cosmos indexer API and key                                                                 |
| `ATOMONE_INDEXER_BASE_URL` / `ATOMONE_INDEXER_API_KEY` | AtomOne dry-run/apply | AtomOne indexer API and key                                                                |

Prefer a read-only mounted local source. Do not put credentials or signed secrets in the source URL because the source identifier is persisted with a ready snapshot.

## Verification and expected runtime

Run the focused feature suites before operating the importer:

```bash
yarn test
```

Semantic validation deliberately opens the JSON five times: metadata, auth accounts, staking validators, staking delegations, and gentxs are each fail-closed sections with independent pinned counts and shape checks. `apply` opens the account array once more only after all validation and preflight checks pass, so no database mutation overlaps unverified parsing. The importer also hashes the private temporary source before validation and re-hashes it immediately before dry-run/apply; do not cache or remove the second hash because it proves the verified file did not change before persistence.

For the 121–510 MB pinned sources, expect runtime and temporary I/O to scale with five semantic passes (six in `apply`) plus the integrity passes. Keep the mounted source and system temporary directory on reliable local storage. Reducing these passes would require retaining large unverified sections in memory or weakening the pre-mutation integrity boundary and is not part of this one-off importer.

## 1. Verify the pinned source without a database

Cosmos Hub:

```bash
GENESIS_IMPORT_MODE=verify-only \
COSMOSHUB_GENESIS_SOURCE=/mounted/genesis.cosmoshub-4.json.gz \
yarn tsx scripts/import-genesis-state.ts cosmoshub
```

AtomOne:

```bash
GENESIS_IMPORT_MODE=verify-only \
ATOMONE_GENESIS_SOURCE=/mounted/atomone-1-genesis.json \
yarn tsx scripts/import-genesis-state.ts atomone
```

A successful result reports `outcome: "verified"`. Hash, chain ID, initial height, staking denom, account wrapper/type counts, validator/delegation references, gentx shape, and all pinned row counts have passed. Temporary files are removed in both success and failure paths.

## 2. Prove the migration and dry-run in disposable PostgreSQL

Create a fresh disposable PostgreSQL 16 database with the `vector` extension available. Apply the normal migration history with `prisma migrate deploy`; do not generate a migration.

Before any import, inspect the protected index from PostgreSQL itself:

```sql
SELECT pg_get_indexdef('podcast_chunks_embedding_idx'::regclass);
```

The result must still be an HNSW index over `embedding vector_cosine_ops` with `m=16` and `ef_construction=128`.

Run `dry-run` against the disposable ValidatorInfo database and the matching read-only indexer API:

```bash
GENESIS_IMPORT_MODE=dry-run \
DATABASE_URL=postgresql://.../validatorinfo_disposable \
COSMOSHUB_GENESIS_SOURCE=/mounted/genesis.cosmoshub-4.json.gz \
COSMOS_INDEXER_BASE_URL=https://cosmos-indexer.example \
COSMOS_INDEXER_API_KEY=... \
yarn tsx scripts/import-genesis-state.ts cosmoshub
```

The matching `chains` row must already exist with `name=cosmoshub` and `chain_id=cosmoshub-4` (or `name=atomone` and `chain_id=atomone-1`). A successful result reports `outcome: "dry-run"` and leaves all three genesis tables unchanged.

## 3. Prove apply/retry behavior in disposable PostgreSQL

Change only the mode:

```bash
GENESIS_IMPORT_MODE=apply \
DATABASE_URL=postgresql://.../validatorinfo_disposable \
COSMOSHUB_GENESIS_SOURCE=/mounted/genesis.cosmoshub-4.json.gz \
COSMOS_INDEXER_BASE_URL=https://cosmos-indexer.example \
COSMOS_INDEXER_API_KEY=... \
yarn tsx scripts/import-genesis-state.ts cosmoshub
```

The process obtains a chain-specific PostgreSQL advisory lock on one dedicated session. A first complete run reports `outcome: "imported"`. A repeat with the same verified identity and counts reports `outcome: "ready-noop"` and does not rebuild children.

Inspect publication and child counts:

```sql
SELECT c.name,
       gs.status,
       gs.sha256,
       gs.initial_height,
       gs.boundary_height,
       gs.boundary_time,
       gs.account_count,
       gs.delegation_count,
       gs.ready_at
FROM genesis_snapshots gs
JOIN chains c ON c.id = gs.chain_id
WHERE c.name IN ('cosmoshub', 'atomone');

SELECT gs.id,
       gs.account_count,
       COUNT(DISTINCT ga.id) AS actual_accounts
FROM genesis_snapshots gs
LEFT JOIN genesis_accounts ga ON ga.snapshot_id = gs.id
GROUP BY gs.id, gs.account_count;

SELECT gs.id,
       gs.delegation_count,
       COUNT(DISTINCT gd.id) AS actual_delegations
FROM genesis_snapshots gs
LEFT JOIN genesis_delegations gd ON gd.snapshot_id = gs.id
GROUP BY gs.id, gs.delegation_count;
```

Only `status=ready` is consumable by the application. Stored counts and actual child counts must agree exactly.

## Interrupted import and manual retry

If a process fails after creating or updating a snapshot, the row remains `status=importing`; it is never published as ready. Preserve the error output and diagnose the cause first.

After the cause is corrected, rerun `apply` with the same pinned source. Under the same advisory lock, the importer deletes only that snapshot's account/delegation children, streams them again, verifies exact counts, and publishes ready. Do not manually set `status=ready`, do not edit count columns, and do not delete a ready snapshot to force replacement.

If an existing ready snapshot has a different hash, height/time boundary, or counts, the importer stops. Treat this as a new design/migration decision rather than a retry.

## Mandatory stop conditions

Do not proceed to `apply` when any of the following occurs:

- archive or decompressed JSON SHA-256 mismatch;
- temporary file identity changes between verification and persistence;
- chain ID, initial height, staking denom, account type/count, validator/delegation/gentx shape, or reference mismatch;
- ValidatorInfo `Chain` identity mismatch;
- indexer coverage is absent or outside the pinned compatible height set;
- an unknown account wrapper, unknown validator, non-positive/invalid amount, or conflicting stored identity is found;
- the target is not a disposable database during rehearsal;
- the protected HNSW definition differs or any proposed SQL touches the podcast/vector objects;
- the target is live and explicit human authorization for migration/import has not been given.

After a disposable rehearsal, rerun the HNSW catalog query and a safe migration-history-to-physical-database diff. The physical database should have no pending migration delta, and `podcast_chunks_embedding_idx` must be unchanged.
