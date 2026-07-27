import { Prisma, PrismaClient } from '@prisma/client';

import logger from '@/logger';
import { withAdvisoryLock } from '@/server/tools/advisory-lock';
import { type GenesisCoverage, fetchGenesisCoverage } from '@/server/tools/genesis/coverage';
import {
  assertVerifiedGenesisSourceUnchanged,
  cleanupVerifiedGenesisSource,
  fetchAndVerifyGenesisSource,
} from '@/server/tools/genesis/fetch-verify';
import { type GenesisChainName, getGenesisProfile } from '@/server/tools/genesis/profile';
import { validateGenesisSource } from '@/server/tools/genesis/scan';
import { persistValidatedGenesis } from '@/server/tools/genesis/write-batches';

const { logInfo } = logger('import-genesis-state');

export type GenesisImportMode = 'verify-only' | 'dry-run' | 'apply';

type ImportGenesisOptions = {
  source?: string;
  mode?: GenesisImportMode;
  batchSize?: number;
  databaseUrl?: string;
  coverage?: GenesisCoverage;
};

export type GenesisImportResult = {
  mode: GenesisImportMode;
  chainId: string;
  jsonSha256: string;
  accounts: number;
  delegations: number;
  outcome: 'verified' | 'dry-run' | 'imported' | 'ready-noop';
};

const parseMode = (value: string | undefined): GenesisImportMode => {
  const mode = value ?? 'verify-only';
  if (mode !== 'verify-only' && mode !== 'dry-run' && mode !== 'apply') {
    throw new Error(`GENESIS_IMPORT_MODE must be verify-only, dry-run, or apply: ${mode}`);
  }
  return mode;
};

const parseBatchSize = (value: number | undefined): number => {
  const raw = value ?? Number(process.env.GENESIS_IMPORT_BATCH_SIZE ?? 5_000);
  if (!Number.isInteger(raw) || raw < 1 || raw > 5_000) {
    throw new Error('GENESIS_IMPORT_BATCH_SIZE must be an integer between 1 and 5000');
  }
  return raw;
};

const buildSnapshotMeta = (
  file: Awaited<ReturnType<typeof fetchAndVerifyGenesisSource>>,
  summary: Awaited<ReturnType<typeof validateGenesisSource>>,
  coverage: GenesisCoverage,
): Prisma.InputJsonValue => ({
  archiveSha256: file.archiveSha256,
  jsonSha256: file.jsonSha256,
  chainId: summary.chainId,
  initialHeight: summary.initialHeight.toString(),
  genesisTime: summary.genesisTime.toISOString(),
  denom: summary.denom,
  rawCounts: summary.counts,
  storedDelegations: summary.delegationRows.length,
  accountTypes: summary.accountTypes,
  coverage: {
    earliestHeight: coverage.earliestHeight.toString(),
    earliestTime: coverage.earliestTime.toISOString(),
  },
});

export const importGenesisState = async (
  chainName: GenesisChainName,
  options: ImportGenesisOptions = {},
): Promise<GenesisImportResult> => {
  const profile = getGenesisProfile(chainName);
  const source = options.source ?? process.env[profile.sourceEnvName];
  if (!source) throw new Error(`${profile.sourceEnvName} is required`);
  const mode = parseMode(options.mode ?? process.env.GENESIS_IMPORT_MODE);
  const batchSize = parseBatchSize(options.batchSize);

  const file = await fetchAndVerifyGenesisSource(profile, source);
  try {
    const summary = await validateGenesisSource(file, profile, (section, count) => {
      logInfo(`${profile.chainId}: validated ${section} (${count})`);
    });
    const baseResult = {
      mode,
      chainId: profile.chainId,
      jsonSha256: file.jsonSha256,
      accounts: summary.counts.accounts,
      delegations: summary.delegationRows.length,
    };
    if (mode === 'verify-only') {
      return { ...baseResult, outcome: 'verified' };
    }

    const databaseUrl = options.databaseUrl ?? process.env.DATABASE_URL;
    if (!databaseUrl) throw new Error('DATABASE_URL is required for dry-run and apply modes');
    const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });
    try {
      const chain = await prisma.chain.findUnique({
        where: { name: profile.chainName },
        select: { id: true, chainId: true },
      });
      if (!chain || chain.chainId !== profile.chainId) {
        throw new Error(
          `ValidatorInfo chain identity mismatch for ${profile.chainName}: expected ${profile.chainId}, received ${chain?.chainId ?? 'missing'}`,
        );
      }

      const coverage = options.coverage ?? (await fetchGenesisCoverage(profile));
      const boundaryTime = profile.chainName === 'atomone' ? summary.genesisTime : coverage.earliestTime;
      const meta = buildSnapshotMeta(file, summary, coverage);
      await assertVerifiedGenesisSourceUnchanged(profile, file);
      if (mode === 'dry-run') {
        return { ...baseResult, outcome: 'dry-run' };
      }

      const persistence = await withAdvisoryLock(
        {
          connectionString: databaseUrl,
          lockName: `validatorinfo-genesis-import:${profile.chainId}`,
          applicationName: `validatorinfo-${profile.chainName}-genesis-import`,
        },
        async () =>
          persistValidatedGenesis({
            prisma,
            chainDatabaseId: chain.id,
            profile,
            file,
            summary,
            coverage,
            boundaryTime,
            meta,
            batchSize,
            onAccountBatch: (persisted) => logInfo(`${profile.chainId}: persisted ${persisted} account inputs`),
          }),
      );
      return { ...baseResult, outcome: persistence.outcome };
    } finally {
      await prisma.$disconnect();
    }
  } finally {
    await cleanupVerifiedGenesisSource(file);
  }
};

export default importGenesisState;
