import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { FC } from 'react';

import CopyButton from '@/components/common/copy-button';
import { ChainWithParams } from '@/services/chain-service';
import { aztecIndexer } from '@/services/aztec-indexer-api';
import cosmosIndexer from '@/services/cosmos-indexer-api';
import logosIndexer from '@/services/logos-indexer-api';

interface OwnProps {
  chain: ChainWithParams | null;
  hash: string;
}

const ExpandedBlockInformation: FC<OwnProps> = async ({ chain, hash }) => {
  const t = await getTranslations('BlockInformationPage');
  const isLogos = chain?.name === 'logos-testnet';
  const isCosmoshub = chain?.name === 'cosmoshub';

  if (isCosmoshub) {
    if (!/^\d+$/.test(hash)) {
      notFound();
    }

    let block;
    try {
      const response = await cosmosIndexer.getBlockByHeight(hash, { revalidate: false });
      block = response?.data;
    } catch (error) {
      console.error('Error fetching Cosmos block for expanded view:', error);
      notFound();
    }
    if (!block) {
      notFound();
    }

    const expandedData: Array<{ title: string; data: string | number; type: 'hash' | 'number' | 'text' }> = [
      { title: 'last commit hash', data: block.last_commit_hash ?? '—', type: 'hash' },
      { title: 'data hash', data: block.data_hash ?? '—', type: 'hash' },
      { title: 'app hash', data: block.app_hash ?? '—', type: 'hash' },
      { title: 'proposer address', data: block.proposer_address, type: 'hash' },
      { title: 'size bytes', data: block.size_bytes ?? '—', type: 'number' },
      { title: 'evidence count', data: block.evidence_count, type: 'number' },
      { title: 'transaction count', data: block.tx_count, type: 'number' },
    ];

    const formatData = (data: string | number, type: 'hash' | 'number' | 'text') => {
      if (type === 'hash') {
        if (typeof data === 'string' && data === '—') {
          return <div className="font-handjet text-lg">{data}</div>;
        }
        return (
          <div className="flex flex-row items-center gap-2">
            <span className="break-all font-handjet text-lg hover:text-highlight">{data}</span>
            <CopyButton value={data.toString()} size="md" />
          </div>
        );
      }
      if (type === 'number') {
        return (
          <div className="font-handjet text-lg hover:text-highlight">
            {typeof data === 'number' ? data.toLocaleString('en-US') : data}
          </div>
        );
      }
      return <div className="hover:text-highlight">{data}</div>;
    };

    return (
      <div className="mb-5 mt-5">
        {expandedData.map((item) => (
          <div key={item.title} className="mt-2 flex w-full hover:bg-bgHover">
            <div className="w-3/12 items-center border-b border-r border-bgSt py-4 pl-8 font-sfpro text-lg">
              {t(item.title as 'block hash')}
            </div>
            <div className="flex w-9/12 cursor-pointer items-center gap-2 border-b border-bgSt py-4 pl-6 pr-4 font-sfpro text-base">
              {formatData(item.data, item.type)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isLogos) {
    let block;
    try {
      block = await logosIndexer.getBlock(hash, { revalidate: false });
    } catch (error) {
      console.error('Error fetching Logos block for expanded view:', error);
      notFound();
    }
    if (!block) {
      notFound();
    }

    const proof = block.raw?.header.proof_of_leadership;
    const expandedData: Array<{ title: string; data: string | number; type: 'hash' | 'number' | 'text' }> = [
      { title: 'block root', data: block.block_root, type: 'hash' },
      { title: 'parent block', data: block.parent_block, type: 'hash' },
      { title: 'leader key', data: block.leader_key, type: 'hash' },
      { title: 'voucher commitment', data: block.voucher_cm, type: 'hash' },
      { title: 'entropy', data: block.entropy, type: 'hash' },
      ...(proof
        ? [
            { title: 'entropy contribution', data: proof.entropy_contribution, type: 'hash' as const },
            { title: 'proof size', data: proof.proof.length, type: 'number' as const },
          ]
        : []),
      { title: 'transaction count', data: block.tx_count, type: 'number' },
    ];

    const formatData = (data: string | number, type: 'hash' | 'number' | 'text') => {
      if (type === 'hash') {
        return (
          <div className="flex flex-row items-center gap-2">
            <span className="break-all font-handjet text-lg hover:text-highlight">{data}</span>
            <CopyButton value={data.toString()} size="md" />
          </div>
        );
      }
      if (type === 'number') {
        return (
          <div className="font-handjet text-lg hover:text-highlight">
            {typeof data === 'number' ? data.toLocaleString('en-US') : data}
          </div>
        );
      }
      return <div className="hover:text-highlight">{data}</div>;
    };

    return (
      <div className="mb-5 mt-5">
        {expandedData.map((item) => (
          <div key={item.title} className="mt-2 flex w-full hover:bg-bgHover">
            <div className="w-3/12 items-center border-b border-r border-bgSt py-4 pl-8 font-sfpro text-lg">
              {t(item.title as 'block root')}
            </div>
            <div className="flex w-9/12 cursor-pointer items-center gap-2 border-b border-bgSt py-4 pl-6 pr-4 font-sfpro text-base">
              {formatData(item.data, item.type)}
            </div>
          </div>
        ))}
      </div>
    );
  }

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
      title: 'sponge blob hash',
      data: block.header.spongeBlobHash ?? '0x',
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
