import { embed } from 'ai';
import { google } from '@ai-sdk/google';

import logger from '@/logger';
import ChainService from '@/services/chain-service';
import SearchService from '@/services/search-service';
import ValidatorService from '@/services/validator-service';
import podcastService from '@/services/podcast-service';
import { toHumanTokens } from '@/services/ai/tools/utils';
import { PODCAST_EMBEDDING_DIMENSIONS, PODCAST_EMBEDDING_MODEL_ID } from '@/server/config/podcast-config';

const { logError } = logger('value-search-service');

const HOST_IDENTITY = 'FA230088439F5B88';
const HOST_MONIKER = 'Citizen Web3';
const DEFAULT_LIMIT = 5;
const MAX_LIMIT = 10;
const MAX_EVIDENCE_PER_CANDIDATE = 4;
const OVERFETCH_MULTIPLIER = 12;
const EMBEDDING_MODEL = google.textEmbeddingModel(PODCAST_EMBEDDING_MODEL_ID);

type SpeakerRole = 'GUEST' | 'HOST' | 'ALL';

type SearchChunkResult = Awaited<ReturnType<typeof podcastService.searchChunks>>[number];
type ValidatorSearchResult = Awaited<ReturnType<typeof ValidatorService.searchByMoniker>>[number];
type ResolvedChain = {
  id: number;
  name: string;
  prettyName: string;
  ecosystem: string;
};

type ValueEvidence = {
  quote: string;
  context: string | null;
  speakerRole: string;
  speakerName: string | null;
  episodeTitle: string;
  episodeUrl: string;
  episodeSlug: string;
  sourceType: 'podcast' | 'cw3-doc';
  similarity: number;
  chainName: string | null;
  chainPrettyName: string | null;
  validatorId: number | null;
  validatorMoniker: string | null;
  mentionedEntities: string[];
};

type ValueNetwork = {
  chainName: string;
  chainPrettyName: string;
  ecosystem: string;
  operatorAddress: string;
  jailed: boolean;
  commission: string;
  uptime: number | null;
  missedBlocks: number | null;
  delegatorsAmount: number;
  tokens: number | null;
  denom: string | null;
  apr: number | null;
  currentPrice: number | null;
};

type ValueValidator = {
  validatorId: number;
  moniker: string;
  identity: string;
  website: string | null;
  score: number;
  evidence: ValueEvidence[];
  networks: ValueNetwork[];
};

type CandidateBucket = {
  key: string;
  validatorId: number | null;
  monikerHint: string | null;
  identityHint: string | null;
  score: number;
  evidenceMap: Map<string, ValueEvidence>;
};

type ValueSearchResult = {
  query: string;
  chain: {
    id: number;
    name: string;
    prettyName: string;
    ecosystem: string;
  } | null;
  total: number;
  validators: ValueValidator[];
  message?: string;
};

type FindValidatorsByValuesArgs = {
  query: string;
  chainName?: string;
  limit?: number;
  speakerRole?: SpeakerRole;
};

const normalizeValue = (value: string) =>
  value
    .toLowerCase()
    .replace(/[.\-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const truncateText = (value: string, limit: number) => {
  if (value.length <= limit) {
    return value;
  }

  return `${value.slice(0, Math.max(limit - 3, 0)).trimEnd()}...`;
};

const roundScore = (score: number) => Math.round(score * 100) / 100;

const embedQuery = async (query: string): Promise<number[]> => {
  const { embedding } = await embed({
    model: EMBEDDING_MODEL,
    value: query,
    providerOptions: {
      google: {
        taskType: 'RETRIEVAL_QUERY',
        outputDimensionality: PODCAST_EMBEDDING_DIMENSIONS,
      },
    },
  });

  return embedding;
};

const isCw3Doc = (episodeSlug: string) =>
  episodeSlug.startsWith('__cw3_') || episodeSlug === '__host_meta__';

const isHostEvidence = (chunk: SearchChunkResult) =>
  chunk.speakerRole === 'HOST'
  || chunk.validatorMoniker?.toLowerCase() === HOST_MONIKER.toLowerCase()
  || chunk.primaryProject?.toLowerCase() === HOST_MONIKER.toLowerCase()
  || isCw3Doc(chunk.episodeSlug);

const getCandidateKey = (chunk: SearchChunkResult) => {
  if (chunk.validatorId) {
    return `validator:${chunk.validatorId}`;
  }

  if (isHostEvidence(chunk)) {
    return `host:${HOST_IDENTITY}`;
  }

  const hint = chunk.validatorMoniker || chunk.primaryProject || chunk.speakerName || chunk.guestName;
  if (hint) {
    return `text:${normalizeValue(hint)}`;
  }

  return `source:${chunk.episodeSlug}:${chunk.chunkIndex}`;
};

const getCandidateHints = (chunk: SearchChunkResult) => {
  if (chunk.validatorId) {
    return {
      monikerHint: chunk.validatorMoniker,
      identityHint: null,
    };
  }

  if (isHostEvidence(chunk)) {
    return {
      monikerHint: HOST_MONIKER,
      identityHint: HOST_IDENTITY,
    };
  }

  const hint = chunk.validatorMoniker || chunk.primaryProject || chunk.speakerName || chunk.guestName;

  return {
    monikerHint: hint,
    identityHint: null,
  };
};

const createEvidence = (chunk: SearchChunkResult): ValueEvidence => ({
  quote: truncateText(chunk.content.trim(), 280),
  context: truncateText((chunk.question || chunk.contextPrefix || '').trim(), 180) || null,
  speakerRole: chunk.speakerRole,
  speakerName: (chunk.speakerRole === 'HOST'
    ? HOST_MONIKER
    : (chunk.speakerName || chunk.guestName || chunk.validatorMoniker || chunk.primaryProject)) ?? null,
  episodeTitle: chunk.episodeTitle,
  episodeUrl: chunk.episodeUrl,
  episodeSlug: chunk.episodeSlug,
  sourceType: isCw3Doc(chunk.episodeSlug) ? 'cw3-doc' : 'podcast',
  similarity: roundScore(chunk.similarity),
  chainName: chunk.chainName,
  chainPrettyName: chunk.chainPrettyName,
  validatorId: chunk.validatorId,
  validatorMoniker: chunk.validatorMoniker,
  mentionedEntities: chunk.mentionedEntities,
});

const mapNetwork = (node: ValidatorSearchResult['nodes'][number]): ValueNetwork => ({
  chainName: node.chain.name,
  chainPrettyName: node.chain.prettyName,
  ecosystem: node.chain.ecosystem,
  operatorAddress: node.operatorAddress,
  jailed: node.jailed,
  commission: node.rate,
  uptime: node.uptime,
  missedBlocks: node.missedBlocks,
  delegatorsAmount: node.delegatorsAmount ?? 0,
  tokens: toHumanTokens(node.tokens, node.chain.params?.coinDecimals),
  denom: node.chain.params?.denom ?? null,
  apr: node.chain.tokenomics?.apr ?? null,
  currentPrice: node.chain.prices?.[0]?.value ?? null,
});

const resolveChainTarget = async (chainName: string): Promise<ResolvedChain | null> => {
  const safeChainName = chainName.trim();
  if (!safeChainName) {
    return null;
  }

  const exact = await ChainService.getByName(safeChainName);
  if (exact) {
    return exact;
  }

  const normalizedQuery = normalizeValue(safeChainName);
  const { chains } = await SearchService.findAll(safeChainName);
  const rankedChain = chains.find((chain) =>
    normalizeValue(chain.name) === normalizedQuery
    || normalizeValue(chain.prettyName) === normalizedQuery,
  ) || chains[0] || null;

  if (!rankedChain) {
    return null;
  }

  return exact ?? rankedChain;
};

const pickBestValidatorMatch = (
  validators: ValidatorSearchResult[],
  expectedValidatorId: number | null,
  expectedIdentity: string | null,
  searchQuery: string,
): ValidatorSearchResult | null => {
  if (expectedValidatorId !== null) {
    const exactById = validators.find((validator) => validator.id === expectedValidatorId);
    if (exactById) {
      return exactById;
    }
  }

  if (expectedIdentity) {
    const exactByIdentity = validators.find((validator) => validator.identity === expectedIdentity);
    if (exactByIdentity) {
      return exactByIdentity;
    }
  }

  const normalizedQuery = normalizeValue(searchQuery);
  const exactByMoniker = validators.find((validator) => normalizeValue(validator.moniker) === normalizedQuery);
  if (exactByMoniker) {
    return exactByMoniker;
  }

  return validators[0] ?? null;
};

const getSearchResults = async (bucket: CandidateBucket): Promise<ValidatorSearchResult | null> => {
  let searchQuery = bucket.monikerHint;
  let expectedValidatorId = bucket.validatorId;
  let expectedIdentity = bucket.identityHint;

  if (bucket.validatorId !== null) {
    const validator = await ValidatorService.getById(bucket.validatorId);
    if (!validator) {
      return null;
    }

    searchQuery = validator.moniker;
    expectedValidatorId = validator.id;
    expectedIdentity = validator.identity;
  }

  if (!searchQuery || searchQuery.trim() === '') {
    return null;
  }

  const validators = await ValidatorService.searchByMoniker(searchQuery, MAX_LIMIT * 2);
  if (validators.length === 0) {
    return null;
  }

  return pickBestValidatorMatch(validators, expectedValidatorId, expectedIdentity, searchQuery);
};

const filterNetworksByChain = (
  validator: ValidatorSearchResult,
  chain: ResolvedChain | null,
) => {
  if (!chain) {
    return validator.nodes;
  }

  const normalizedChainName = normalizeValue(chain.name);
  const normalizedPrettyName = normalizeValue(chain.prettyName);

  return validator.nodes.filter((node) => {
    const nodeChainName = normalizeValue(node.chain.name);
    const nodePrettyName = normalizeValue(node.chain.prettyName);
    return nodeChainName === normalizedChainName || nodePrettyName === normalizedPrettyName;
  });
};

const buildCandidateBuckets = (
  chunks: SearchChunkResult[],
  chain: ResolvedChain | null,
) => {
  const buckets = new Map<string, CandidateBucket>();

  for (const chunk of chunks) {
    const key = getCandidateKey(chunk);
    const hints = getCandidateHints(chunk);
    const evidenceKey = `${chunk.episodeSlug}:${chunk.chunkIndex}`;
    const sourceBonus = isCw3Doc(chunk.episodeSlug)
      ? 18
      : chunk.speakerRole === 'HOST'
        ? 10
        : 4;
    const validatorBonus = chunk.validatorId ? 12 : 0;
    const chainBonus = chain && (
      normalizeValue(chunk.chainName ?? '') === normalizeValue(chain.name)
      || normalizeValue(chunk.chainPrettyName ?? '') === normalizeValue(chain.prettyName)
    )
      ? 8
      : 0;

    const bucket = buckets.get(key) ?? {
      key,
      validatorId: chunk.validatorId,
      monikerHint: hints.monikerHint,
      identityHint: hints.identityHint,
      score: 0,
      evidenceMap: new Map<string, ValueEvidence>(),
    };

    bucket.validatorId = bucket.validatorId ?? chunk.validatorId;
    bucket.monikerHint = bucket.monikerHint ?? hints.monikerHint;
    bucket.identityHint = bucket.identityHint ?? hints.identityHint;
    bucket.score += roundScore(chunk.similarity * 100) + sourceBonus + validatorBonus + chainBonus;

    if (!bucket.evidenceMap.has(evidenceKey) && bucket.evidenceMap.size < MAX_EVIDENCE_PER_CANDIDATE) {
      bucket.evidenceMap.set(evidenceKey, createEvidence(chunk));
    }

    buckets.set(key, bucket);
  }

  return buckets;
};

const resolveCandidate = async (
  bucket: CandidateBucket,
  chain: ResolvedChain | null,
): Promise<ValueValidator | null> => {
  const matchedValidator = await getSearchResults(bucket);
  if (!matchedValidator) {
    return null;
  }

  const networks = filterNetworksByChain(matchedValidator, chain);
  if (networks.length === 0) {
    return null;
  }

  const evidence = Array.from(bucket.evidenceMap.values());
  const score = roundScore(bucket.score + evidence.length * 5 + networks.length * 2);

  return {
    validatorId: matchedValidator.id,
    moniker: matchedValidator.moniker,
    identity: matchedValidator.identity,
    website: matchedValidator.website ?? null,
    score,
    evidence,
    networks: networks.map(mapNetwork),
  };
};

const findValidatorsByValues = async ({
  query,
  chainName,
  limit,
  speakerRole,
}: FindValidatorsByValuesArgs): Promise<ValueSearchResult> => {
  const safeQuery = query.trim();
  if (!safeQuery) {
    return {
      query,
      chain: null,
      total: 0,
      validators: [],
      message: 'Query is required.',
    };
  }

  const take = Math.min(Math.max(limit ?? DEFAULT_LIMIT, 1), MAX_LIMIT);

  try {
    const chain = chainName?.trim()
      ? await resolveChainTarget(chainName)
      : null;

    if (chainName?.trim() && !chain) {
      return {
        query: safeQuery,
        chain: null,
        total: 0,
        validators: [],
        message: `Chain "${chainName}" not found.`,
      };
    }

    const embedding = await embedQuery(safeQuery);
    const raw = await podcastService.searchChunks(
      embedding,
      Math.max(take * OVERFETCH_MULTIPLIER, 30),
      undefined,
      speakerRole,
    );

    if (raw.length === 0) {
      return {
        query: safeQuery,
        chain: chain ? {
          id: chain.id,
          name: chain.name,
          prettyName: chain.prettyName,
          ecosystem: chain.ecosystem,
        } : null,
        total: 0,
        validators: [],
        message: 'No relevant knowledge base content found for this query.',
      };
    }

    const rankedChunks = raw
      .filter((chunk) => chunk.content.trim() !== '')
      .sort((a, b) => b.similarity - a.similarity);

    const buckets = buildCandidateBuckets(rankedChunks, chain);
    const resolvedCandidates = await Promise.all(
      Array.from(buckets.values()).map((bucket) => resolveCandidate(bucket, chain)),
    );

    const validators = resolvedCandidates
      .filter((validator): validator is ValueValidator => Boolean(validator))
      .sort((a, b) => b.score - a.score || a.moniker.localeCompare(b.moniker))
      .slice(0, take);

    return {
      query: safeQuery,
      chain: chain ? {
        id: chain.id,
        name: chain.name,
        prettyName: chain.prettyName,
        ecosystem: chain.ecosystem,
      } : null,
      total: validators.length,
      validators,
      message: validators.length === 0
        ? 'No validator candidates matched this value query.'
        : undefined,
    };
  } catch (error) {
    logError(`findValidatorsByValues failed: ${error instanceof Error ? error.message : String(error)}`);
    return {
      query: safeQuery,
      chain: null,
      total: 0,
      validators: [],
      message: 'Failed to discover validators by values.',
    };
  }
};

const valueSearchService = {
  findValidatorsByValues,
};

export type {
  FindValidatorsByValuesArgs,
  ValueEvidence,
  ValueNetwork,
  ValueSearchResult,
  ValueValidator,
};

export default valueSearchService;
