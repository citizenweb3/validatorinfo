import { embedMany, generateText } from 'ai';
import { Prisma } from '@prisma/client';

import {
  db,
  EMBEDDING_MODEL,
  HOST_IDENTITY,
  HOST_MONIKER,
  logInfo,
  logWarn,
  PODCAST_EMBEDDING_DIMENSIONS,
  PODCAST_EMBEDDING_MODEL_ID,
  RATE_LIMIT_DELAY_MS,
  SUMMARY_MODEL,
  wordCount,
} from './shared';

const HOST_TOPICS = [
  {
    name: 'Technologies',
    prompt: 'What are the host\'s views on blockchain technologies? Cover: tech stack preferences, protocols he advocates for (Tendermint, CometBFT, CosmWasm, etc.), development tools, programming languages, technical trade-offs (performance vs decentralization), privacy technologies (Monero, zero-knowledge proofs, mixnets), Layer 1 vs Layer 2, modular vs monolithic architecture, open source philosophy, specific technical innovations he discusses.',
  },
  {
    name: 'Validating',
    prompt: 'What are the host\'s views on validation and staking? Cover: his own experience running validators, what makes a good validator, validator economics and sustainability, infrastructure challenges, hardware and DevOps, skin in the game philosophy, validator independence, centralization risks in staking (liquid staking, institutional validators), slashing and security, validator community and collaboration, decentralization of validator sets.',
  },
  {
    name: 'Consensus',
    prompt: 'What are the host\'s views on consensus and governance? Cover: consensus mechanisms (BFT, PoS, PoW, DPoS), on-chain governance vs off-chain, DAO structures, voting participation and apathy, community decision-making, proposal processes, treasury and funding governance, censorship resistance, decentralization of power, token-weighted voting problems, quadratic voting, conviction voting, specific governance debates he references.',
  },
  {
    name: 'Blockchain networks',
    prompt: 'What are the host\'s views on specific blockchain networks and ecosystems? Cover: Cosmos ecosystem (Hub, IBC, app-chains, sovereignty), Ethereum and its ecosystem, Bitcoin, Polkadot, Solana, privacy chains (Monero, Secret Network, Zcash), specific L1s and L2s he discusses, interoperability and cross-chain communication, multi-chain future vs winner-take-all, network effects, ecosystem culture differences, specific projects and protocols he champions or criticizes (name each one).',
  },
  {
    name: 'AI',
    prompt: 'What are the host\'s views on artificial intelligence? Cover: AI technologies and tools, philosophy around AI development, AI integration with blockchain and Web3, AI agents and autonomous systems, decentralized AI vs centralized AI, risks and opportunities of AI, AI governance and ethics, specific AI projects or concepts he discusses, impact of AI on the crypto ecosystem and validators, AI and privacy concerns.',
  },
  {
    name: 'Privacy',
    prompt: 'What are the host\'s views on privacy? Cover: privacy as a fundamental right, privacy coins and chains (Monero, Zcash, Secret Network), zero-knowledge proofs, mixnets, encryption, surveillance and censorship resistance, privacy vs transparency trade-offs, KYC/AML debates, data sovereignty, self-custody, private transactions, privacy-preserving technologies, specific privacy projects he champions or criticizes, privacy in DeFi, privacy and regulation, why privacy matters for validators and users.',
  },
  {
    name: 'Decentralization',
    prompt: 'What are the host\'s views on decentralization? Cover: what true decentralization means, centralization risks in crypto (exchanges, staking providers, infrastructure), decentralization of validator sets, geographic distribution, client diversity, self-sovereignty, censorship resistance, decentralization vs efficiency trade-offs, decentralized governance, decentralized identity, decentralization of development teams, specific examples of centralization he criticizes, projects he praises for decentralization, community ownership, permissionless systems, trustlessness.',
  },
];

const MIN_TOPIC_WORDS = 300;
const MAX_RETRIES = 3;

export const generateHostMeta = async (processed: number): Promise<void> => {
  const hostMetaSlug = '__host_meta__';
  const existingMeta = await db.podcastEpisode.findUnique({ where: { slug: hostMetaSlug } });

  if (!existingMeta || processed > 0) {
    const hostChunks = await db.$queryRaw<{ content: string }[]>`
        SELECT pc.content
        FROM podcast_chunks pc
        WHERE pc.speaker_role = 'HOST'
          AND array_length(string_to_array(trim(pc.content), ' '), 1) > 50
        ORDER BY pc.id LIMIT 500
    `;

    if (hostChunks.length > 0) {
      const hostTexts = hostChunks.map(c => c.content).join('\n\n');

      const topicSummaries: string[] = [];
      for (const topic of HOST_TOPICS) {
        let bestText = '';
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
          const { text } = await generateText({
            model: SUMMARY_MODEL,
            maxOutputTokens: 4096,
            system: 'You are a podcast content analyst writing an exhaustive profile. Rules: (1) Only include information directly stated in the provided text. (2) Always output in English. (3) Be extremely thorough — cover every subtopic mentioned. (4) Include specific names of projects, people, networks, and tools. (5) Include direct quotes where possible. (6) Your output MUST be at least 400 words. Shorter outputs are unacceptable.',
            prompt: `Below are remarks by the host of the Citizen Web3 podcast (Serj / Citizen Web3) across ~150 episodes of interviews with blockchain validators and projects.

TOPIC: ${topic.name}

INSTRUCTIONS: ${topic.prompt}

REQUIREMENTS:
- Write MINIMUM 400 words, target 500-700 words
- Cover every subtopic listed above that has evidence in the text
- Include direct quotes with attribution
- Name specific projects, people, networks, and tools
- Plain prose paragraphs only — no headers, no bullet points, no markdown, no numbering

Host remarks:
${hostTexts}`,
          });
          const words = wordCount(text?.trim() || '');
          if (text?.trim() && words >= MIN_TOPIC_WORDS) {
            bestText = text.trim();
            logInfo(`Host meta topic "${topic.name}": ${words} words (attempt ${attempt})`);
            break;
          }
          if (text?.trim() && words > wordCount(bestText)) {
            bestText = text.trim();
          }
          if (attempt < MAX_RETRIES) {
            logWarn(`Host meta topic "${topic.name}": only ${words} words (attempt ${attempt}/${MAX_RETRIES}), retrying...`);
            await new Promise(r => setTimeout(r, RATE_LIMIT_DELAY_MS));
          } else {
            logWarn(`Host meta topic "${topic.name}": ${words} words after ${MAX_RETRIES} attempts, using best result`);
          }
        }
        if (bestText) {
          topicSummaries.push(bestText);
        }
        await new Promise(r => setTimeout(r, RATE_LIMIT_DELAY_MS));
      }

      const hostSummary = topicSummaries.join('\n\n');

      if (hostSummary.trim()) {
        const HOST_CHUNK_SIZE = 150;
        const hostChunksWithTopics: { text: string; topicName: string }[] = [];

        for (let t = 0; t < topicSummaries.length; t++) {
          const words = topicSummaries[t].split(/\s+/);
          for (let i = 0; i < words.length; i += HOST_CHUNK_SIZE) {
            hostChunksWithTopics.push({
              text: words.slice(i, i + HOST_CHUNK_SIZE).join(' '),
              topicName: HOST_TOPICS[t].name,
            });
          }
        }

        const hostEmbeddingInputs = hostChunksWithTopics.map(
          (chunk) => `Citizen Web3 podcast host on ${chunk.topicName}:\n${chunk.text}`,
        );
        const { embeddings: hostEmbeddings } = await embedMany({
          model: EMBEDDING_MODEL,
          values: hostEmbeddingInputs,
          providerOptions: {
            google: {
              taskType: 'RETRIEVAL_DOCUMENT',
              outputDimensionality: PODCAST_EMBEDDING_DIMENSIONS,
            },
          },
        });

        await db.$transaction(async (tx) => {
          await tx.podcastEpisode.deleteMany({ where: { slug: hostMetaSlug } });

          const episode = await tx.podcastEpisode.create({
            data: {
              slug: hostMetaSlug,
              title: 'Citizen Web3 — Host Values & Philosophy',
              episodeUrl: 'https://podcast.citizenweb3.com',
              guestName: 'Citizen Web3',
              summary: hostSummary,
              identity: HOST_IDENTITY,
              moniker: HOST_MONIKER,
            },
          });

          const values: Prisma.Sql[] = [];
          for (let i = 0; i < hostChunksWithTopics.length; i++) {
            const vectorStr = `[${hostEmbeddings[i].join(',')}]`;
            values.push(Prisma.sql`(
              ${episode.id}, ${'HOST'}, ${'Citizen Web3'},
              ${null}, ${hostChunksWithTopics[i].text},
              ${'Citizen Web3 podcast host — aggregated values and philosophy'},
              ${i}, ${vectorStr}::vector, ${PODCAST_EMBEDDING_MODEL_ID},
              NOW(), NOW()
            )`);
          }

          if (values.length > 0) {
            await tx.$executeRaw`
                INSERT INTO podcast_chunks (episode_id, speaker_role, speaker_name, question, content,
                                            context_prefix, chunk_index, embedding, embedding_model,
                                            created_at, updated_at)
                VALUES ${Prisma.join(values)}
            `;
          }
        }, { timeout: 30000 });

        logInfo(`Generated host meta-summary: ${wordCount(hostSummary)} words, ${hostChunksWithTopics.length} chunks`);
      }
    }
  }
};
