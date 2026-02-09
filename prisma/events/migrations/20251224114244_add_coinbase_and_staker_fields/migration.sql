-- AlterTable
ALTER TABLE "aztec_staked_events" ADD COLUMN     "coinbase_split_contract_address" VARCHAR(256),
ADD COLUMN     "staker_implementation" VARCHAR(256);
