import importGenesisState from '@/server/jobs/import-genesis-state';
import type { GenesisChainName } from '@/server/tools/genesis/profile';

const readChainName = (value: string | undefined): GenesisChainName => {
  if (value !== 'cosmoshub' && value !== 'atomone') {
    throw new Error('usage: yarn tsx scripts/import-genesis-state.ts <cosmoshub|atomone>');
  }

  return value;
};

const main = async (): Promise<void> => {
  const result = await importGenesisState(readChainName(process.argv[2]));
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
};

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`genesis import failed: ${message}\n`);
  process.exitCode = 1;
});
