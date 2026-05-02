import { notFound } from 'next/navigation';
import { FC } from 'react';

import CopyButton from '@/components/common/copy-button';
import { aztecIndexer } from '@/services/aztec-indexer-api';
import logosIndexer from '@/services/logos-indexer-api';
import { ChainWithParams } from '@/services/chain-service';

interface OwnProps {
  chain: ChainWithParams | null;
  hash: string;
}

const JsonBlockInformation: FC<OwnProps> = async ({ chain, hash }) => {
  const isLogos = chain?.name === 'logos-testnet';
  const isHeight = /^\d+$/.test(hash);

  let block;
  try {
    if (isLogos) {
      block = await logosIndexer.getBlock(hash, { revalidate: false });
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
