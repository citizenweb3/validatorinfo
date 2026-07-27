import { type GenesisSnapshot, Prisma, type PrismaClient } from '@prisma/client';

import type { GenesisCoverage } from '@/server/tools/genesis/coverage';
import { type VerifiedGenesisSource, assertVerifiedGenesisSourceUnchanged } from '@/server/tools/genesis/fetch-verify';
import type { GenesisProfile } from '@/server/tools/genesis/profile';
import { streamValidatedGenesisAccounts } from '@/server/tools/genesis/scan';
import type { GenesisValidationSummary } from '@/server/tools/genesis/types';

export type GenesisPersistenceResult = {
  snapshotId: number;
  outcome: 'imported' | 'ready-noop';
};

type PersistGenesisOptions = {
  prisma: PrismaClient;
  chainDatabaseId: number;
  profile: GenesisProfile;
  file: VerifiedGenesisSource;
  summary: GenesisValidationSummary;
  coverage: GenesisCoverage;
  boundaryTime: Date;
  meta: Prisma.InputJsonValue;
  batchSize: number;
  onAccountBatch?: (persistedInputAccounts: number) => void | Promise<void>;
};

const chunkRows = <T>(rows: readonly T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let index = 0; index < rows.length; index += size) chunks.push(rows.slice(index, index + size));
  return chunks;
};

const assertReadySnapshotMatches = async (
  prisma: PrismaClient,
  snapshot: GenesisSnapshot,
  options: PersistGenesisOptions,
): Promise<void> => {
  const expectedDelegations = options.summary.delegationRows.length;
  const identityMatches =
    snapshot.sha256 === options.file.jsonSha256 &&
    snapshot.initialHeight === options.summary.initialHeight &&
    snapshot.boundaryHeight === options.coverage.earliestHeight &&
    snapshot.boundaryTime.getTime() === options.boundaryTime.getTime() &&
    snapshot.accountCount === options.summary.counts.accounts &&
    snapshot.delegationCount === expectedDelegations;
  if (!identityMatches) {
    throw new Error(`ready genesis snapshot identity differs for ${options.profile.chainId}`);
  }

  const [accountCount, delegationCount] = await Promise.all([
    prisma.genesisAccount.count({ where: { snapshotId: snapshot.id } }),
    prisma.genesisDelegation.count({ where: { snapshotId: snapshot.id } }),
  ]);
  if (accountCount !== snapshot.accountCount || delegationCount !== snapshot.delegationCount) {
    throw new Error(
      `ready genesis snapshot child counts differ for ${options.profile.chainId}: accounts=${accountCount}, delegations=${delegationCount}`,
    );
  }
};

export const persistValidatedGenesis = async (options: PersistGenesisOptions): Promise<GenesisPersistenceResult> => {
  if (!Number.isInteger(options.batchSize) || options.batchSize < 1 || options.batchSize > 5_000) {
    throw new Error('genesis import batch size must be between 1 and 5000');
  }

  await assertVerifiedGenesisSourceUnchanged(options.profile, options.file);
  const existing = await options.prisma.genesisSnapshot.findUnique({
    where: { chainId: options.chainDatabaseId },
  });
  if (existing?.status === 'ready') {
    await assertReadySnapshotMatches(options.prisma, existing, options);
    return { snapshotId: existing.id, outcome: 'ready-noop' };
  }
  if (existing && existing.status !== 'importing') {
    throw new Error(`unsupported genesis snapshot status: ${existing.status}`);
  }

  const snapshotData = {
    sourceUrl: options.file.sourceUrl,
    sha256: options.file.jsonSha256,
    meta: options.meta,
    initialHeight: options.summary.initialHeight,
    boundaryHeight: options.coverage.earliestHeight,
    boundaryTime: options.boundaryTime,
    accountCount: 0,
    delegationCount: 0,
    status: 'importing',
    readyAt: null,
  };
  const snapshot = existing
    ? await options.prisma.genesisSnapshot.update({ where: { id: existing.id }, data: snapshotData })
    : await options.prisma.genesisSnapshot.create({
        data: { ...snapshotData, chain: { connect: { id: options.chainDatabaseId } } },
      });

  await options.prisma.$transaction([
    options.prisma.genesisDelegation.deleteMany({ where: { snapshotId: snapshot.id } }),
    options.prisma.genesisAccount.deleteMany({ where: { snapshotId: snapshot.id } }),
  ]);

  let addressBatch: string[] = [];
  let persistedInputAccounts = 0;
  const flushAddressBatch = async () => {
    if (addressBatch.length === 0) return;
    const addresses = addressBatch;
    addressBatch = [];
    await options.prisma.genesisAccount.createMany({
      data: addresses.map((address) => ({ snapshotId: snapshot.id, address })),
      skipDuplicates: true,
    });
    persistedInputAccounts += addresses.length;
    await options.onAccountBatch?.(persistedInputAccounts);
  };

  await streamValidatedGenesisAccounts(options.file, options.profile, async (address) => {
    addressBatch.push(address);
    if (addressBatch.length >= options.batchSize) await flushAddressBatch();
  });
  await flushAddressBatch();

  for (const rows of chunkRows(options.summary.delegationRows, options.batchSize)) {
    await options.prisma.genesisDelegation.createMany({
      data: rows.map((row) => ({ ...row, snapshotId: snapshot.id })),
    });
  }

  const [accountCount, delegationCount] = await Promise.all([
    options.prisma.genesisAccount.count({ where: { snapshotId: snapshot.id } }),
    options.prisma.genesisDelegation.count({ where: { snapshotId: snapshot.id } }),
  ]);
  if (accountCount !== options.summary.counts.accounts || persistedInputAccounts !== options.summary.counts.accounts) {
    throw new Error(
      `persisted account count mismatch: expected ${options.summary.counts.accounts}, inputs=${persistedInputAccounts}, rows=${accountCount}`,
    );
  }
  if (delegationCount !== options.summary.delegationRows.length) {
    throw new Error(
      `persisted delegation count mismatch: expected ${options.summary.delegationRows.length}, rows=${delegationCount}`,
    );
  }

  await options.prisma.genesisSnapshot.update({
    where: { id: snapshot.id },
    data: {
      accountCount,
      delegationCount,
      status: 'ready',
      readyAt: new Date(),
    },
  });
  return { snapshotId: snapshot.id, outcome: 'imported' };
};
