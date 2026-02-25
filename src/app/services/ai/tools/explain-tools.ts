import { tool } from 'ai';
import { z } from 'zod';
import logger from '@/logger';
import TxService from '@/services/tx-service';
import BlocksService from '@/services/blocks-service';
import ChainService from '@/services/chain-service';
import aztecIndexer from '@/services/aztec-indexer-api';
import { AztecTxEffect, AztecPendingTx, AztecDroppedTx, AztecBlock } from '@/services/aztec-indexer-api/types';
import { ZERO_HASH } from './utils';

const { logError } = logger('ai-tools:explain');

const SUPPORTED_TX_CHAINS = ['aztec'];

const formatFee = (fee: string | number): string => {
  const num = Number(fee);
  if (!isFinite(num) || num === 0) return '0';
  if (num >= 1e18) return `${(num / 1e18).toFixed(6)} ETH`;
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)} Gwei`;
  return `${num} Wei`;
};

const summarizeConfirmedTx = (tx: AztecTxEffect) => ({
  txHash: tx.txHash,
  status: 'confirmed',
  blockHeight: Number(tx.blockHeight),
  blockHash: tx.blockHash,
  reverted: tx.revertCode?.code !== 0,
  revertCode: tx.revertCode?.code ?? 0,
  fee: formatFee(tx.transactionFee),
  feeRaw: String(tx.transactionFee),
  timestamp: tx.timestamp ? new Date(tx.timestamp).toISOString() : null,
  birthTimestamp: tx.txBirthTimestamp ? new Date(tx.txBirthTimestamp).toISOString() : null,
  noteHashesCount: tx.noteHashes?.filter((h) => h !== ZERO_HASH).length ?? 0,
  nullifiersCount: tx.nullifiers?.filter((h) => h !== ZERO_HASH).length ?? 0,
  l2ToL1MessagesCount: tx.l2ToL1Msgs?.filter((h) => h !== ZERO_HASH).length ?? 0,
  publicLogsCount: tx.publicLogs?.length ?? 0,
  privateLogsCount: tx.privateLogs?.length ?? 0,
  publicDataWritesCount: tx.publicDataWrites?.length ?? 0,
  isOrphaned: tx.isOrphaned ?? false,
});

const summarizePendingTx = (tx: AztecPendingTx) => ({
  txHash: tx.txHash,
  status: 'pending',
  feePayer: tx.feePayer,
  birthTimestamp: tx.birthTimestamp ? new Date(tx.birthTimestamp).toISOString() : null,
  description: 'Transaction is in the mempool waiting to be included in a block.',
});

const summarizeDroppedTx = (tx: AztecDroppedTx) => ({
  txHash: tx.txHash,
  status: 'dropped',
  createdAt: tx.createdAsPendingAt ? new Date(tx.createdAsPendingAt).toISOString() : null,
  droppedAt: tx.droppedAt ? new Date(tx.droppedAt).toISOString() : null,
  description: 'Transaction was removed from the mempool without being included in a block.',
});

const summarizeBlock = (block: AztecBlock) => {
  const gv = block.header?.globalVariables;
  const txCount = block.body?.txEffects?.length ?? 0;

  return {
    hash: block.hash,
    height: Number(block.height),
    finalized: block.finalizationStatus === 3,
    finalizationStatus: block.finalizationStatus === 3 ? 'finalized' : 'pending',
    timestamp: gv?.timestamp ? new Date(gv.timestamp * 1000).toISOString() : null,
    transactionCount: txCount,
    slotNumber: gv?.slotNumber ?? null,
    blockProducer: gv?.coinbase ?? null,
    feeRecipient: gv?.feeRecipient ?? null,
    totalFees: block.header?.totalFees ? formatFee(block.header.totalFees) : '0',
    totalManaUsed: block.header?.totalManaUsed ?? null,
    gasFees: gv?.gasFees ?? null,
    chainId: gv?.chainId ?? null,
    protocolVersion: gv?.version ?? null,
    txHashes: block.body?.txEffects?.map((tx) => tx.txHash) ?? [],
  };
};

export const explainTools = {
  getRecentTransactions: tool({
    description:
      'Get recent transactions for a blockchain network with metrics (total count, 24h count, avg fee). Use when user asks about transactions on a network, wants to see recent activity, or asks about transaction volume.',
    inputSchema: z.object({
      chainName: z.string().describe('The chain name, e.g. "aztec". Currently only Aztec supports real transaction data.'),
      page: z.number().optional().default(1).describe('Page number (default 1)'),
      perPage: z.number().optional().default(5).describe('Transactions per page (default 5, max 10)'),
    }),
    execute: async ({ chainName, page, perPage }) => {
      try {
        const normalized = chainName.toLowerCase();

        if (!SUPPORTED_TX_CHAINS.includes(normalized)) {
          return {
            chainName,
            supported: false,
            message: `Transaction data is not yet available for "${chainName}". Currently supported: ${SUPPORTED_TX_CHAINS.join(', ')}.`,
          };
        }

        const take = Math.min(perPage ?? 5, 10);
        const [txResult, chain] = await Promise.all([
          TxService.getTxsByChainName(normalized, page ?? 1, take),
          ChainService.getByName(normalized),
        ]);

        let metrics = null;
        if (chain) {
          metrics = await TxService.getAztecTxMetrics(chain.id);
        }

        return {
          chainName: normalized,
          supported: true,
          totalPages: txResult.totalPages,
          metrics: metrics ? {
            totalTransactions: metrics.totalTxs,
            last24h: metrics.txsLast24h,
            last30d: metrics.txs30d,
            tps: metrics.tps,
            averageFee: metrics.avgFee ? formatFee(metrics.avgFee) : null,
          } : null,
          transactions: txResult.txs.map((tx) => ({
            hash: tx.hash,
            status: tx.status,
            blockHeight: tx.blockHeight ?? null,
            fee: tx.transactionFee ? formatFee(tx.transactionFee) : null,
            timestamp: tx.timestamp ? new Date(tx.timestamp).toISOString() : null,
          })),
        };
      } catch (error) {
        logError(`getRecentTransactions failed for "${chainName}": ${error instanceof Error ? error.message : String(error)}`);
        return { error: `Failed to get transactions for "${chainName}"` };
      }
    },
  }),

  getTransactionByHash: tool({
    description:
      'Get full details about a specific transaction by its hash and explain its contents. Shows status, fees, block info, note hashes, nullifiers, logs, and data writes. Use when user asks to explain or look up a specific transaction.',
    inputSchema: z.object({
      txHash: z.string().describe('The transaction hash (0x-prefixed hex string)'),
    }),
    execute: async ({ txHash }) => {
      try {
        const result = await TxService.getAztecTxByHash(txHash);

        if (!result) {
          return { error: `Transaction "${txHash}" not found. It may not exist or the chain may not be supported.` };
        }

        if (result.status === 'confirmed') {
          return summarizeConfirmedTx(result.data as AztecTxEffect);
        }
        if (result.status === 'pending') {
          return summarizePendingTx(result.data as AztecPendingTx);
        }
        return summarizeDroppedTx(result.data as AztecDroppedTx);
      } catch (error) {
        logError(`getTransactionByHash failed for "${txHash}": ${error instanceof Error ? error.message : String(error)}`);
        return { error: `Failed to look up transaction "${txHash}"` };
      }
    },
  }),

  getRecentBlocks: tool({
    description:
      'Get recent blocks for a blockchain network. Shows hash, height, timestamp, finalization status, and transaction count. Use when user asks about blocks or recent block activity.',
    inputSchema: z.object({
      chainName: z.string().describe('The chain name, e.g. "aztec". Currently only Aztec supports real block data.'),
      page: z.number().optional().default(1).describe('Page number (default 1)'),
      perPage: z.number().optional().default(5).describe('Blocks per page (default 5, max 10)'),
    }),
    execute: async ({ chainName, page, perPage }) => {
      try {
        const normalized = chainName.toLowerCase();

        if (!SUPPORTED_TX_CHAINS.includes(normalized)) {
          return {
            chainName,
            supported: false,
            message: `Block data is not yet available for "${chainName}". Currently supported: ${SUPPORTED_TX_CHAINS.join(', ')}.`,
          };
        }

        const take = Math.min(perPage ?? 5, 10);
        const { blocks, totalPages } = await BlocksService.getBlocksByChainName(normalized, page ?? 1, take);

        return {
          chainName: normalized,
          supported: true,
          totalPages,
          blocks: blocks.map((b) => ({
            hash: b.hash,
            height: b.height,
            timestamp: b.timestamp,
            finalized: b.finalizationStatus === 3,
          })),
        };
      } catch (error) {
        logError(`getRecentBlocks failed for "${chainName}": ${error instanceof Error ? error.message : String(error)}`);
        return { error: `Failed to get blocks for "${chainName}"` };
      }
    },
  }),

  getBlockDetails: tool({
    description:
      'Get full details about a specific block by hash or height. Shows all metadata: producer, fees, mana, gas fees, transactions in the block, slot number, finalization status. Use when user asks to explain or look up a specific block.',
    inputSchema: z.object({
      blockId: z.string().describe('Block hash (0x-prefixed) or block height number as string'),
    }),
    execute: async ({ blockId }) => {
      try {
        let block: AztecBlock | null = null;

        const isHeight = /^\d+$/.test(blockId);
        if (isHeight) {
          block = await aztecIndexer.getBlockByHeight(Number(blockId), { cache: 'no-store' });
        } else {
          block = await aztecIndexer.getBlockByHash(blockId, { cache: 'no-store' });
        }

        if (!block) {
          return { error: `Block "${blockId}" not found.` };
        }

        return summarizeBlock(block);
      } catch (error) {
        logError(`getBlockDetails failed for "${blockId}": ${error instanceof Error ? error.message : String(error)}`);
        return { error: `Failed to look up block "${blockId}"` };
      }
    },
  }),
};
