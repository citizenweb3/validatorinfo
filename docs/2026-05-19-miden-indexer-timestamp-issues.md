# Miden Indexer — Block & Transaction Timestamp Issues

**Reporter:** ValidatorInfo team
**Date:** 2026-05-19
**Indexer URL:** `https://indexer.miden-testnet.citizenweb3.com`
**Affected endpoints:** `/api/v1/stats`, `/api/v1/blocks`, `/api/v1/transactions`

---

## Summary

Two timestamp issues found while integrating Miden testnet indexer into ValidatorInfo block explorer:

1. **Transactions have no production timestamp** — only `inserted_at` (indexer write time). This is an indexer-side gap and should be fixed.
2. **Block `timestamp` field lags ~5 days behind real time** while `block_num` grows live. Likely upstream (block producer / chain) — please investigate and document.

---

## Evidence (live data, 2026-05-19 14:27 UTC)

### `GET /api/v1/stats`

```json
{
  "last_block": 679699,
  "total_blocks": 679700,
  "total_transactions": 917927,
  "total_notes": 456809,
  "total_nullifiers": 219487,
  "total_accounts": 132598,
  "latest_block_timestamp": "2026-05-14T01:00:19.000Z",
  "tps": 6.0333
}
```

`latest_block_timestamp` = **14.05**, but `last_block` had already grown to **679899** by the time we hit `/blocks` minutes later — chain is producing live.

### `GET /api/v1/blocks?limit=5&offset=0`

```
block_num | timestamp                | inserted_at
679899    | 2026-05-14T01:10:19.000Z | 2026-05-19T14:27:59.907Z
679898    | 2026-05-14T01:10:16.000Z | 2026-05-19T14:27:59.907Z
679897    | 2026-05-14T01:10:13.000Z | 2026-05-19T14:27:59.907Z
679896    | 2026-05-14T01:10:10.000Z | 2026-05-19T14:27:59.907Z
679895    | 2026-05-14T01:10:07.000Z | 2026-05-19T14:27:59.907Z
```

`timestamp` increments ~3 sec per block (consistent with block time), but absolute value sits on **14.05** while real time is **19.05**.

### `GET /api/v1/transactions?limit=5&offset=0`

```
tx_id (short) | block_num | inserted_at              | timestamp
0f4a20d0...   | 679899    | 2026-05-19T14:27:59.907Z | (missing)
a3ae5630...   | 679895    | 2026-05-19T14:27:59.907Z | (missing)
...           | 679895    | 2026-05-19T14:27:59.907Z | (missing)
...           | 679895    | 2026-05-19T14:27:59.907Z | (missing)
...           | 679894    | 2026-05-19T14:27:59.907Z | (missing)
```

No `timestamp` or `block_timestamp` field. Consumers cannot determine when a transaction was produced without a second request per tx.

---

## Issue #1 — Transaction object lacks production timestamp

**Indexer-side bug. Please fix.**

### Current behavior

Transaction objects from `GET /api/v1/transactions` and `GET /api/v1/transactions/{tx_id}` expose only `inserted_at` (when the indexer wrote the row to its DB).

### Expected behavior

Each transaction should expose the timestamp of its parent block (the on-chain production timestamp). Either:

- **Option A** — add field `block_timestamp` (ISO 8601 string) to the transaction response, OR
- **Option B** — join `blocks` on `block_num` server-side and expose `timestamp` directly on the transaction.

Option A is preferred — keeps schema explicit and avoids naming collision with future per-tx timestamp fields.

### Why this matters

- Block explorers must display when a transaction was **produced**, not when it was **indexed**.
- Without this field, every transaction detail view needs an extra request `GET /api/v1/blocks/{block_num}` — multiplies API load and adds latency.
- `inserted_at` is meaningless for users — depends on indexer downtime, backfill jobs, restarts, network latency between producer and indexer.
- Currently in our explorer, the block page shows chain `timestamp` (14.05) while the transaction page shows `inserted_at` (19.05) — confusing inconsistency for the same chain event.

### Proposed schema

```json
{
  "tx_id": "0f4a20d059ca45ed149c7a69d00d86ad461f3f27de6fca1212b491e3ed0df784",
  "block_num": 679899,
  "block_timestamp": "2026-05-14T01:10:19.000Z",
  "inserted_at": "2026-05-19T14:27:59.907Z",
  "account_id": "...",
  "init_account_state": "...",
  "final_account_state": "...",
  ...
}
```

Apply to both list endpoint (`/transactions`) and detail endpoint (`/transactions/{tx_id}`).

---

## Issue #2 — Block timestamp lags real time by ~5 days

**Likely upstream (block producer / chain), but please investigate and document.**

### Symptom

- `block_num` grows live: 679699 → 679899 in a few minutes (chain producing blocks normally).
- `timestamp` field on latest block returns `2026-05-14T01:10:19Z` while wall clock is `2026-05-19T14:27Z`.
- Delta between adjacent blocks is correct (~3 sec block time). Only the absolute base is shifted ~5 days into the past.

### Possible causes (need indexer team / chain team to confirm)

1. Block producer node clock unsynchronized (NTP drift, container clock skew, sealed VM clock).
2. Miden testnet uses a non-wall-clock timestamp semantic (e.g., L1 anchor time, slot number translated to time, sequencer-local monotonic clock).
3. Producer hardcodes initial timestamp at genesis and only increments by per-block delta.

### Action requested

- Clarify what `timestamp` in the Miden block header is supposed to represent (chain spec / sequencer doc).
- If it should be wall-clock UTC: check producer node NTP, restart if drift confirmed.
- If it has different semantic (slot-based, L1-anchor, monotonic): document this clearly in the indexer API spec so consumers don't treat it as wall time.

---

## Reproduction

```bash
TOKEN="<bearer-token>"
BASE="https://indexer.miden-testnet.citizenweb3.com"

curl -sS -H "Authorization: Bearer $TOKEN" "$BASE/api/v1/stats"
curl -sS -H "Authorization: Bearer $TOKEN" "$BASE/api/v1/blocks?limit=5&offset=0"
curl -sS -H "Authorization: Bearer $TOKEN" "$BASE/api/v1/transactions?limit=5&offset=0"
```

---

## Impact on downstream consumers

- Block explorer page shows chain `timestamp` (14.05) — appears stale to end users.
- Transaction explorer page shows `inserted_at` (19.05) — visible mismatch with block page for the same on-chain event.
- Cannot reliably compute "last activity", "tx age", or "block age" without a per-tx round-trip to `/blocks/{block_num}`.
- TPS metric on `/stats` is unaffected (computed independently), but `latest_block_timestamp` looks suspicious next to a growing `last_block`.

---

## Priority

- **Issue #1** — high. Blocks UX of every explorer integration. Schema change is non-breaking (additive field).
- **Issue #2** — medium. Needs investigation first to determine whether it is a producer bug or a documentation gap.
