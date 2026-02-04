import { getAddress, parseEther } from 'viem';

import { eventsClient } from '@/db';
import logger from '@/logger';

const { logInfo, logWarn } = logger('get-zombie-validators');

const DEFAULT_EJECTION_THRESHOLD = parseEther('196000');

const getCurrentEjectionThreshold = async (chainId: number): Promise<bigint> => {
  const latestThresholdEvent = await eventsClient.aztecLocalEjectionThresholdUpdatedEvent.findFirst({
    where: { chainId },
    orderBy: { blockNumber: 'desc' },
  });

  if (latestThresholdEvent) {
    return BigInt(latestThresholdEvent.newLocalEjectionThreshold);
  }

  logWarn(`No ejection threshold events found for chainId ${chainId}, using default: ${DEFAULT_EJECTION_THRESHOLD.toString()}`);
  return DEFAULT_EJECTION_THRESHOLD;
};

interface ValidatorBalance {
  attester: string;
  effectiveBalance: bigint;
  lastQueuedBlock: bigint;
  totalDeposits: bigint;
  totalSlashed: bigint;
}

export const getZombieValidators = async (chainId: number): Promise<Set<string>> => {
  const ejectionThreshold = await getCurrentEjectionThreshold(chainId);
  logInfo(`Using ejection threshold: ${ejectionThreshold.toString()}`);

  const queuedEvents = await eventsClient.aztecValidatorQueuedEvent.findMany({
    where: { chainId },
    orderBy: { blockNumber: 'desc' },
  });

  const depositEvents = await eventsClient.aztecDepositEvent.findMany({
    where: { chainId },
  });

  const slashingEvents = await eventsClient.aztecSlashedEvent.findMany({
    where: { chainId },
  });

  const exitedEvents = await eventsClient.aztecWithdrawFinalizedEvent.findMany({
    where: { chainId },
    distinct: ['attester'],
  });

  const initiatedEvents = await eventsClient.aztecWithdrawInitiatedEvent.findMany({
    where: { chainId },
    distinct: ['attester'],
  });

  const exitedSet = new Set<string>();
  for (const event of exitedEvents) {
    exitedSet.add(getAddress(event.attester));
  }

  const exitingSet = new Set<string>();
  for (const event of initiatedEvents) {
    const addr = getAddress(event.attester);
    if (!exitedSet.has(addr)) {
      exitingSet.add(addr);
    }
  }

  const lastQueuedBlockMap = new Map<string, bigint>();
  for (const event of queuedEvents) {
    const addr = getAddress(event.attester);
    const blockNum = BigInt(event.blockNumber);
    const existing = lastQueuedBlockMap.get(addr);
    if (!existing || blockNum > existing) {
      lastQueuedBlockMap.set(addr, blockNum);
    }
  }

  const depositsMap = new Map<string, Array<{ blockNumber: bigint; amount: bigint }>>();
  for (const event of depositEvents) {
    const addr = getAddress(event.attester);
    const entry = {
      blockNumber: BigInt(event.blockNumber),
      amount: BigInt(event.amount),
    };
    const existing = depositsMap.get(addr);
    if (existing) {
      existing.push(entry);
    } else {
      depositsMap.set(addr, [entry]);
    }
  }

  const slashingMap = new Map<string, Array<{ blockNumber: bigint; amount: bigint }>>();
  for (const event of slashingEvents) {
    const addr = getAddress(event.attester);
    const entry = {
      blockNumber: BigInt(event.blockNumber),
      amount: BigInt(event.amount),
    };
    const existing = slashingMap.get(addr);
    if (existing) {
      existing.push(entry);
    } else {
      slashingMap.set(addr, [entry]);
    }
  }

  const zombieValidators = new Set<string>();
  const balances: ValidatorBalance[] = [];

  for (const [attester, lastQueuedBlock] of Array.from(lastQueuedBlockMap.entries())) {
    if (exitedSet.has(attester)) {
      continue;
    }

    if (exitingSet.has(attester)) {
      continue;
    }

    const deposits = depositsMap.get(attester) || [];
    let totalDeposits = BigInt(0);
    for (const deposit of deposits) {
      if (deposit.blockNumber >= lastQueuedBlock) {
        totalDeposits += deposit.amount;
      }
    }

    const slashing = slashingMap.get(attester) || [];
    let totalSlashed = BigInt(0);
    for (const slash of slashing) {
      if (slash.blockNumber > lastQueuedBlock) {
        totalSlashed += slash.amount;
      }
    }

    const effectiveBalance = totalDeposits - totalSlashed;

    balances.push({
      attester,
      effectiveBalance,
      lastQueuedBlock,
      totalDeposits,
      totalSlashed,
    });

    if (effectiveBalance < ejectionThreshold) {
      zombieValidators.add(attester);
    }
  }

  logInfo(
    `Analyzed ${balances.length} active validators, found ${zombieValidators.size} zombies ` +
    `(threshold: ${ejectionThreshold.toString()})`,
  );

  return zombieValidators;
};

export const getValidatorBalances = async (chainId: number): Promise<{
  ejectionThreshold: bigint;
  validators: ValidatorBalance[];
}> => {
  const ejectionThreshold = await getCurrentEjectionThreshold(chainId);

  const queuedEvents = await eventsClient.aztecValidatorQueuedEvent.findMany({
    where: { chainId },
    orderBy: { blockNumber: 'desc' },
  });

  const depositEvents = await eventsClient.aztecDepositEvent.findMany({
    where: { chainId },
  });

  const slashingEvents = await eventsClient.aztecSlashedEvent.findMany({
    where: { chainId },
  });

  const exitedEvents = await eventsClient.aztecWithdrawFinalizedEvent.findMany({
    where: { chainId },
    distinct: ['attester'],
  });

  const exitedSet = new Set<string>();
  for (const event of exitedEvents) {
    exitedSet.add(getAddress(event.attester));
  }

  const lastQueuedBlockMap = new Map<string, bigint>();
  for (const event of queuedEvents) {
    const addr = getAddress(event.attester);
    const blockNum = BigInt(event.blockNumber);
    const existing = lastQueuedBlockMap.get(addr);
    if (!existing || blockNum > existing) {
      lastQueuedBlockMap.set(addr, blockNum);
    }
  }

  const depositsMap = new Map<string, Array<{ blockNumber: bigint; amount: bigint }>>();
  for (const event of depositEvents) {
    const addr = getAddress(event.attester);
    const entry = {
      blockNumber: BigInt(event.blockNumber),
      amount: BigInt(event.amount),
    };
    const existing = depositsMap.get(addr);
    if (existing) {
      existing.push(entry);
    } else {
      depositsMap.set(addr, [entry]);
    }
  }

  const slashingMap = new Map<string, Array<{ blockNumber: bigint; amount: bigint }>>();
  for (const event of slashingEvents) {
    const addr = getAddress(event.attester);
    const entry = {
      blockNumber: BigInt(event.blockNumber),
      amount: BigInt(event.amount),
    };
    const existing = slashingMap.get(addr);
    if (existing) {
      existing.push(entry);
    } else {
      slashingMap.set(addr, [entry]);
    }
  }

  const validators: ValidatorBalance[] = [];

  for (const [attester, lastQueuedBlock] of Array.from(lastQueuedBlockMap.entries())) {
    if (exitedSet.has(attester)) {
      continue;
    }

    const deposits = depositsMap.get(attester) || [];
    let totalDeposits = BigInt(0);
    for (const deposit of deposits) {
      if (deposit.blockNumber >= lastQueuedBlock) {
        totalDeposits += deposit.amount;
      }
    }

    const slashing = slashingMap.get(attester) || [];
    let totalSlashed = BigInt(0);
    for (const slash of slashing) {
      if (slash.blockNumber > lastQueuedBlock) {
        totalSlashed += slash.amount;
      }
    }

    const effectiveBalance = totalDeposits - totalSlashed;

    validators.push({
      attester,
      effectiveBalance,
      lastQueuedBlock,
      totalDeposits,
      totalSlashed,
    });
  }

  return { ejectionThreshold, validators };
};
