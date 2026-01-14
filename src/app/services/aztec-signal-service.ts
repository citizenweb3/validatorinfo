import db, { eventsClient } from '@/db';
import logger from '@/logger';
import { isAztecChainName } from '@/server/tools/chains/aztec/utils/contracts/contracts-config';
import { SortDirection } from '@/server/types';
import { readContractWithFailover } from '@/server/utils/viem-client-with-failover';
import cutHash from '@/utils/cut-hash';
import { getL1RpcUrls } from '@/server/tools/chains/aztec/utils/get-l1-rpc-urls';
import { buildAddressToValidatorMap } from '@/server/tools/chains/aztec/utils/build-address-to-validator-map';

const GSE_PAYLOAD_ABI = [
  {
    inputs: [],
    name: 'ORIGINAL',
    outputs: [{ type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;


const { logError } = logger('aztec-signal-service');


export interface SignalDisplay {
  signaler: {
    address: string;
    validatorId: number | null;
    moniker: string | null;
    validatorUrl: string | null;
  };
  round: string;
  timestamp: Date;
}

export interface PayloadSignalStats {
  payload: string;
  totalSignals: number;
  uniqueSignalers: number;
  isSubmitted: boolean;
}

export interface SignalsListResponse {
  signals: SignalDisplay[];
  pages: number;
  total: number;
}

const getPayloadSignals = async (
  chainName: string,
  payload: string,
  skip: number = 0,
  take: number = 10,
  sortBy: string = 'timestamp',
  order: SortDirection = 'desc',
): Promise<SignalsListResponse> => {
  try {
    const chain = await db.chain.findUnique({ where: { name: chainName } });
    if (!chain) {
      return { signals: [], pages: 0, total: 0 };
    }

    const validSortFields = ['timestamp', 'signaler', 'round', 'blockNumber'];
    const effectiveSortBy = validSortFields.includes(sortBy) ? sortBy : 'timestamp';

    const where = {
      chainId: chain.id,
      payload: { equals: payload, mode: 'insensitive' as const },
    };

    const [events, total] = await Promise.all([
      eventsClient.aztecSignalCastEvent.findMany({
        where,
        skip,
        take,
        orderBy: { [effectiveSortBy]: order },
      }),
      eventsClient.aztecSignalCastEvent.count({ where }),
    ]);

    const addressToValidator = await buildAddressToValidatorMap(chain.id);

    const signals: SignalDisplay[] = events.map((event) => {
      const validator = addressToValidator.get(event.signaler.toLowerCase());

      return {
        signaler: {
          address: event.signaler,
          validatorId: validator?.id ?? null,
          moniker: validator?.moniker ?? event.signaler,
          validatorUrl: validator?.url ?? null,
        },
        round: event.round,
        timestamp: event.timestamp,
      };
    });

    return {
      signals,
      pages: Math.ceil(total / take),
      total,
    };
  } catch (error: any) {
    logError(`Failed to get payload signals for ${chainName}/${payload}: ${error.message}`);
    return { signals: [], pages: 0, total: 0 };
  }
};

const getPayloadSignalStats = async (
  chainName: string,
  payload: string,
): Promise<PayloadSignalStats | null> => {
  try {
    const chain = await db.chain.findUnique({ where: { name: chainName } });
    if (!chain) {
      return null;
    }

    const where = {
      chainId: chain.id,
      payload: { equals: payload, mode: 'insensitive' as const },
    };

    const [signals, submittedEvent] = await Promise.all([
      eventsClient.aztecSignalCastEvent.findMany({
        where,
        select: { signaler: true },
      }),
      eventsClient.aztecPayloadSubmittedEvent.findFirst({
        where: {
          chainId: chain.id,
          payload: { equals: payload, mode: 'insensitive' },
        },
      }),
    ]);

    const uniqueSignalers = new Set(signals.map((s) => s.signaler.toLowerCase())).size;

    return {
      payload,
      totalSignals: signals.length,
      uniqueSignalers,
      isSubmitted: submittedEvent !== null,
    };
  } catch (error: any) {
    logError(`Failed to get payload signal stats for ${chainName}/${payload}: ${error.message}`);
    return null;
  }
};

const isPayloadSubmitted = async (
  chainName: string,
  payload: string,
): Promise<boolean> => {
  try {
    const chain = await db.chain.findUnique({ where: { name: chainName } });
    if (!chain) {
      return false;
    }

    const submittedEvent = await eventsClient.aztecPayloadSubmittedEvent.findFirst({
      where: {
        chainId: chain.id,
        payload: { equals: payload, mode: 'insensitive' },
      },
    });

    return submittedEvent !== null;
  } catch (error: any) {
    logError(`Failed to check if payload is submitted for ${chainName}/${payload}: ${error.message}`);
    return false;
  }
};

const getPayloadSignalers = async (
  chainName: string,
  payload: string,
): Promise<SignalDisplay['signaler'][]> => {
  try {
    const chain = await db.chain.findUnique({ where: { name: chainName } });
    if (!chain) {
      return [];
    }

    const signals = await eventsClient.aztecSignalCastEvent.findMany({
      where: {
        chainId: chain.id,
        payload: { equals: payload, mode: 'insensitive' },
      },
      select: { signaler: true },
      distinct: ['signaler'],
    });

    const addressToValidator = await buildAddressToValidatorMap(chain.id);

    return signals.map((signal) => {
      const validator = addressToValidator.get(signal.signaler.toLowerCase());

      return {
        address: signal.signaler,
        validatorId: validator?.id ?? null,
        moniker: validator?.moniker ?? cutHash({ value: signal.signaler, cutLength: 6 }),
        validatorUrl: validator?.url ?? null,
      };
    });
  } catch (error: any) {
    logError(`Failed to get payload signalers for ${chainName}/${payload}: ${error.message}`);
    return [];
  }
};

const getSignalerStats = async (
  chainName: string,
  signalerAddress: string,
): Promise<{ totalSignals: number; payloadsSignaled: number } | null> => {
  try {
    const chain = await db.chain.findUnique({ where: { name: chainName } });
    if (!chain) {
      return null;
    }

    const signals = await eventsClient.aztecSignalCastEvent.findMany({
      where: {
        chainId: chain.id,
        signaler: { equals: signalerAddress, mode: 'insensitive' },
      },
      select: { payload: true },
    });

    const uniquePayloads = new Set(signals.map((s) => s.payload.toLowerCase())).size;

    return {
      totalSignals: signals.length,
      payloadsSignaled: uniquePayloads,
    };
  } catch (error: any) {
    logError(`Failed to get signaler stats for ${chainName}/${signalerAddress}: ${error.message}`);
    return null;
  }
};

const getOriginalPayload = async (
  chainName: string,
  gsePayloadAddress: string,
): Promise<string | null> => {
  if (!isAztecChainName(chainName)) {
    return null;
  }

  const l1RpcUrls = getL1RpcUrls(chainName);
  if (l1RpcUrls.length === 0) {
    logError(`No L1 RPC URLs for ${chainName}`);
    return null;
  }

  try {
    const originalPayload = await readContractWithFailover<string>(
      l1RpcUrls,
      {
        address: gsePayloadAddress as `0x${string}`,
        abi: GSE_PAYLOAD_ABI,
        functionName: 'ORIGINAL',
      },
      'aztec-signal-service-original-payload',
    );

    return originalPayload;
  } catch (error: any) {
    return null;
  }
};

const AztecSignalService = {
  getPayloadSignals,
  getPayloadSignalStats,
  isPayloadSubmitted,
  getPayloadSignalers,
  getSignalerStats,
  getOriginalPayload,
};

export default AztecSignalService;
