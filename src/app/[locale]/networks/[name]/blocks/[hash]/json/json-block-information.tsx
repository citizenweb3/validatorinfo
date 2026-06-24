import { notFound } from 'next/navigation';
import { FC } from 'react';

import CopyButton from '@/components/common/copy-button';
import { aztecIndexer } from '@/services/aztec-indexer-api';
import atomoneIndexer from '@/services/atomone-indexer-api';
import cosmosIndexer from '@/services/cosmos-indexer-api';
import logosIndexer from '@/services/logos-indexer-api';
import midenIndexer from '@/services/miden-indexer-api';
import { ChainWithParams } from '@/services/chain-service';
import { getMoneroBlockDetail } from '@/server/tools/chains/monero/indexer-client';

interface OwnProps {
  chain: ChainWithParams | null;
  hash: string;
}

const JsonBlockInformation: FC<OwnProps> = async ({ chain, hash }) => {
  if (chain?.consensusType === 'pow') {
    const block = await getMoneroBlockDetail(hash).catch(() => null);
    if (!block) {
      notFound();
    }
    // difficulty/cumulativeDifficulty are BigInt — stringify them so JSON.stringify doesn't throw.
    const jsonString = JSON.stringify(block, (_key, value) => (typeof value === 'bigint' ? value.toString() : value), 4);
    return (
      <div className="mb-5 mr-10 mt-8 hover:bg-bgHover">
        <div className="flex flex-row">
          <div className="ml-20">
            <pre className="w-full whitespace-pre-wrap break-all font-handjet text-lg">{jsonString}</pre>
          </div>
          <div>
            <CopyButton value={jsonString} size="md" />
          </div>
        </div>
      </div>
    );
  }

  const isLogos = chain?.name === 'logos-testnet';
  const isCosmoshub = chain?.name === 'cosmoshub';
  const isMiden = chain?.name === 'miden-testnet';
  const isAtomone = chain?.name === 'atomone';
  const isHeight = /^\d+$/.test(hash);

  let block;
  try {
    if (isCosmoshub) {
      if (!isHeight) {
        notFound();
      }
      const response = await cosmosIndexer.getBlockByHeight(hash, { revalidate: false });
      block = response?.data;
    } else if (isAtomone) {
      if (!isHeight) {
        notFound();
      }
      const response = await atomoneIndexer.getBlockByHeight(hash, { revalidate: false });
      block = response?.data;
    } else if (isLogos) {
      block = await logosIndexer.getBlock(hash, { revalidate: false });
    } else if (isMiden) {
      block = await midenIndexer.getBlock(hash, { revalidate: false });
    } else {
      block = isHeight
        ? await aztecIndexer.getBlockByHeight(parseInt(hash, 10), { revalidate: false })
        : await aztecIndexer.getBlockByHash(hash, { revalidate: false });
    }
  } catch (error) {
    console.error('Error fetching block for JSON view:', error);
    notFound();
  }

  if (!block) {
    notFound();
  }

  const formatData = (data: unknown) => {
    return (
      <pre className="w-full whitespace-pre-wrap break-all font-handjet text-lg">{JSON.stringify(data, null, 4)}</pre>
    );
  };

  return (
    <div className="mb-5 mr-10 mt-8 hover:bg-bgHover">
      <div className="flex flex-row">
        <div className="ml-20">{formatData(block)}</div>
        <div>
          <CopyButton value={JSON.stringify(block, null, 4)} size="md" />
        </div>
      </div>
    </div>
  );
};

export default JsonBlockInformation;
