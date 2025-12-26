import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { FC } from 'react';

import CopyButton from '@/components/common/copy-button';
import { ChainWithParams } from '@/services/chain-service';
import { aztecIndexer } from '@/services/aztec-indexer-api';
import { BufferData } from '@/services/aztec-indexer-api/types';

interface OwnProps {
  chain: ChainWithParams | null;
  hash: string;
}

const bufferToHex = (buffer: BufferData): string => {
  if (!buffer || !buffer.data || !Array.isArray(buffer.data)) {
    return '0x';
  }
  return '0x' + buffer.data.map(byte => byte.toString(16).padStart(2, '0')).join('');
};

const ExpandedBlockInformation: FC<OwnProps> = async ({ chain, hash }) => {
  const t = await getTranslations('BlockInformationPage');
  const isHeight = /^\d+$/.test(hash);

  let block;
  try {
    block = isHeight
      ? await aztecIndexer.getBlockByHeight(parseInt(hash, 10), { revalidate: false })
      : await aztecIndexer.getBlockByHash(hash, { revalidate: false });
  } catch (error) {
    console.error('Error fetching block for expanded view:', error);
    notFound();
  }

  if (!block) {
    notFound();
  }

  const expandedData = [
    {
      title: 'fee per da gas',
      data: block.header.globalVariables.gasFees.feePerDaGas,
      type: 'number',
    },
    {
      title: 'fee per l2 gas',
      data: block.header.globalVariables.gasFees.feePerL2Gas,
      type: 'number',
    },
    {
      title: 'archive root',
      data: block.archive.root,
      type: 'hash',
    },
    {
      title: 'archive next leaf index',
      data: block.archive.nextAvailableLeafIndex,
      type: 'number',
    },
    {
      title: 'last archive root',
      data: block.header.lastArchive.root,
      type: 'hash',
    },
    {
      title: 'last archive next leaf index',
      data: block.header.lastArchive.nextAvailableLeafIndex,
      type: 'number',
    },
    {
      title: 'note hash tree root',
      data: block.header.state.partial.noteHashTree.root,
      type: 'hash',
    },
    {
      title: 'note hash tree next index',
      data: block.header.state.partial.noteHashTree.nextAvailableLeafIndex,
      type: 'number',
    },
    {
      title: 'nullifier tree root',
      data: block.header.state.partial.nullifierTree.root,
      type: 'hash',
    },
    {
      title: 'nullifier tree next index',
      data: block.header.state.partial.nullifierTree.nextAvailableLeafIndex,
      type: 'number',
    },
    {
      title: 'public data tree root',
      data: block.header.state.partial.publicDataTree.root,
      type: 'hash',
    },
    {
      title: 'public data tree next index',
      data: block.header.state.partial.publicDataTree.nextAvailableLeafIndex,
      type: 'number',
    },
    {
      title: 'l1 to l2 message tree root',
      data: block.header.state.l1ToL2MessageTree.root,
      type: 'hash',
    },
    {
      title: 'l1 to l2 message tree next index',
      data: block.header.state.l1ToL2MessageTree.nextAvailableLeafIndex,
      type: 'number',
    },
    {
      title: 'blobs hash',
      data: bufferToHex(block.header.contentCommitment.blobsHash),
      type: 'hash',
    },
    {
      title: 'in hash',
      data: bufferToHex(block.header.contentCommitment.inHash),
      type: 'hash',
    },
    {
      title: 'out hash',
      data: bufferToHex(block.header.contentCommitment.outHash),
      type: 'hash',
    },
  ];

  const formatData = (title: string, data: number | string, type: string) => {
    switch (type) {
      case 'hash':
        return (
          <div className="flex flex-row items-center gap-2">
            <span className="font-handjet text-lg break-all hover:text-highlight">{data}</span>
            <CopyButton value={data.toString()} size={'md'} />
          </div>
        );
      case 'number':
        return (
          <div className="font-handjet text-lg hover:text-highlight">
            {typeof data === 'number' ? data.toLocaleString('en-US') : data}
          </div>
        );
      default:
        return <div className="hover:text-highlight">{data}</div>;
    }
  };

  return (
    <div className="mt-5 mb-5">
      {expandedData.map((item) => (
        <div key={item.title} className="mt-2 flex w-full hover:bg-bgHover">
          <div className="w-3/12 items-center border-b border-r border-bgSt py-4 pl-8 font-sfpro text-lg">
            {t(item.title as 'fee per da gas')}
          </div>
          <div className="flex w-9/12 cursor-pointer items-center gap-2 border-b border-bgSt py-4 pl-6 pr-4 font-sfpro text-base">
            {formatData(item.title, item.data, item.type)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExpandedBlockInformation;
