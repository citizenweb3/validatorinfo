import db from '@/db';
import logger from '@/logger';
import { extractTextFromJson, fetchProposalText, isValidProposalUrl } from '@/server/utils/fetch-proposal-text';
import { getPayloadUriUtil } from '@/server/tools/chains/aztec/utils/get-payload-uri-util';

const { logInfo, logError, logDebug } = logger('update-proposal-texts');

const BATCH_SIZE = 20;
const CLEANUP_BATCH_SIZE = 200;
const MAX_ATTEMPTS = 5;
const DELAY_BETWEEN_FETCHES = 2000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Step 1: Clean up invalid metadata_url values and extract text from JSON blobs */
const cleanupInvalidMetadataUrls = async () => {
  const proposals = await db.proposal.findMany({
    where: {
      metadataUrl: { not: null },
      fullText: null,
    },
    take: CLEANUP_BATCH_SIZE,
    select: {
      id: true,
      proposalId: true,
      metadataUrl: true,
      fullTextAttempts: true,
    },
  });

  let cleaned = 0;
  let textExtracted = 0;

  for (const proposal of proposals) {
    try {
      const metadataUrl = proposal.metadataUrl!;

      if (isValidProposalUrl(metadataUrl)) continue;

      // Not a valid URL — try to extract text from the value itself
      let fullText: string | null = null;

      // Try parsing as JSON (e.g. {"title":"...", "summary":"..."})
      try {
        const json = JSON.parse(metadataUrl);
        if (typeof json === 'object' && json !== null) {
          fullText = extractTextFromJson(json as Record<string, unknown>);
        }
      } catch {
        // Not JSON — plain text, not useful as fullText (usually just a title)
      }

      await db.proposal.update({
        where: { id: proposal.id },
        data: {
          metadataUrl: null,
          fullText,
          fullTextAttempts: 0,
        },
      });

      if (fullText) {
        textExtracted++;
        logInfo(`Extracted text from JSON metadata for proposal ${proposal.proposalId} (${fullText.length} chars)`);
      } else {
        cleaned++;
      }
    } catch (e) {
      logError(`Error cleaning up proposal ${proposal.proposalId}`, e);
    }
  }

  if (cleaned > 0 || textExtracted > 0) {
    logInfo(`Cleanup: cleared ${cleaned} invalid metadata_urls, extracted text from ${textExtracted} JSON blobs`);
  }
};

/** Step 2: Resolve Aztec payload URIs */
const resolveAztecPayloadUris = async () => {
  const aztecProposals = await db.proposal.findMany({
    where: {
      metadataUrl: null,
      fullText: null,
      fullTextAttempts: { lt: MAX_ATTEMPTS },
      chain: {
        name: { in: ['aztec', 'aztec-testnet'] },
      },
    },
    take: BATCH_SIZE,
    include: {
      chain: { select: { name: true } },
    },
  });

  if (aztecProposals.length === 0) return;

  logInfo(`Resolving payload URIs for ${aztecProposals.length} Aztec proposals`);

  for (const proposal of aztecProposals) {
    try {
      const content = JSON.parse(proposal.content as string);
      const payload = content?.payload;

      if (!payload || typeof payload !== 'string') continue;

      const uri = await getPayloadUriUtil(payload, proposal.chain.name);

      if (uri) {
        await db.proposal.update({
          where: { id: proposal.id },
          data: { metadataUrl: uri },
        });
        logInfo(`Resolved Aztec payload URI for proposal ${proposal.proposalId}: ${uri}`);
      } else {
        await db.proposal.update({
          where: { id: proposal.id },
          data: { fullTextAttempts: proposal.fullTextAttempts + 1 },
        });
        logDebug(`Could not resolve Aztec payload URI for proposal ${proposal.proposalId}, attempt ${proposal.fullTextAttempts + 1}`);
      }

      await sleep(DELAY_BETWEEN_FETCHES);
    } catch (e) {
      if (e instanceof SyntaxError) {
        await db.proposal.update({
          where: { id: proposal.id },
          data: { fullTextAttempts: MAX_ATTEMPTS },
        });
        logDebug(`Aztec proposal ${proposal.proposalId} non-JSON content, skipping`);
      } else {
        logError(`Error resolving Aztec payload URI for proposal ${proposal.proposalId}`, e);
        await db.proposal.update({
          where: { id: proposal.id },
          data: { fullTextAttempts: proposal.fullTextAttempts + 1 },
        });
      }
    }
  }
};

/** Step 3: Fetch full text for proposals with valid metadataUrl */
const fetchProposalTexts = async () => {
  // Pick up proposals that either have no fullText OR were never processed (fullText = description)
  const proposals = await db.proposal.findMany({
    where: {
      metadataUrl: { not: null },
      fullTextAttempts: { lt: MAX_ATTEMPTS },
      OR: [
        { fullText: null },
        { fullTextAttempts: 0 },
      ],
    },
    orderBy: { createdAt: 'desc' },
    take: BATCH_SIZE,
    include: {
      chain: { select: { name: true, prettyName: true } },
    },
  });

  if (proposals.length === 0) {
    logDebug('No proposals need text fetching');
    return;
  }

  logInfo(`Processing ${proposals.length} proposals for text fetching`);

  for (const proposal of proposals) {
    try {
      logDebug(
        `Fetching text for proposal ${proposal.proposalId} (${proposal.chain.name}), ` +
        `attempt ${proposal.fullTextAttempts + 1}/${MAX_ATTEMPTS}: ${proposal.metadataUrl}`,
      );

      const fetchedText = await fetchProposalText(proposal.metadataUrl!);

      await db.proposal.update({
        where: { id: proposal.id },
        data: {
          fullText: fetchedText || proposal.fullText,
          fullTextAttempts: proposal.fullTextAttempts + 1,
        },
      });

      if (fetchedText) {
        logInfo(
          `Fetched full text for proposal ${proposal.proposalId} ` +
          `(${proposal.chain.name}): ${fetchedText.length} chars`,
        );
      } else {
        logDebug(
          `Could not fetch text for proposal ${proposal.proposalId} ` +
          `(${proposal.chain.name}), attempt ${proposal.fullTextAttempts + 1}`,
        );
      }

      await sleep(DELAY_BETWEEN_FETCHES);
    } catch (e) {
      logError(`Error processing proposal ${proposal.proposalId}`, e);

      await db.proposal.update({
        where: { id: proposal.id },
        data: { fullTextAttempts: proposal.fullTextAttempts + 1 },
      });
    }
  }
};

const updateProposalTexts = async () => {
  try {
    await cleanupInvalidMetadataUrls();
    await resolveAztecPayloadUris();
    await fetchProposalTexts();
  } catch (e) {
    logError('Error in updateProposalTexts job', e);
  }
};

export default updateProposalTexts;
