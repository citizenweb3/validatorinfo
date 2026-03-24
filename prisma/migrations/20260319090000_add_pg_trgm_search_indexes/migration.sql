CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS "validators_moniker_trgm_idx"
  ON "validators"
  USING gin (lower("moniker") gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "validators_details_trgm_idx"
  ON "validators"
  USING gin (lower(coalesce("details", '')) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "chains_name_trgm_idx"
  ON "chains"
  USING gin (lower("name") gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "chains_pretty_name_trgm_idx"
  ON "chains"
  USING gin (lower("pretty_name") gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "chain_params_denom_trgm_idx"
  ON "chain_params"
  USING gin (lower("denom") gin_trgm_ops);
