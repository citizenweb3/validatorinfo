import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { FC } from 'react';

import CopyButton from '@/components/common/copy-button';
import RoundedButton from '@/components/common/rounded-button';
import Tooltip from '@/components/common/tooltip';
import { aztecIndexer } from '@/services/aztec-indexer-api';
import { ChainWithParams } from '@/services/chain-service';

interface OwnProps {
  chain: ChainWithParams | null;
  hash: string;
}

const BlockInformation: FC<OwnProps> = async ({ chain, hash }) => {
  const t = await getTranslations('BlockInformationPage');
  const isHeight = /^\d+$/.test(hash);

  let block;
  try {
    block = isHeight
      ? await aztecIndexer.getBlockByHeight(parseInt(hash, 10), { revalidate: false })
      : await aztecIndexer.getBlockByHash(hash, { revalidate: false });
  } catch (error) {
    console.error('Error fetching block:', error);
    notFound();
  }

  if (!block) {
    notFound();
  }

  const blockHeight = typeof block.height === 'string' ? parseInt(block.height, 10) : block.height;

  const timestamp = new Date(block.header.globalVariables.timestamp);
  const formattedTimestamp = timestamp
    .toISOString()
    .replace('T', ' ')
    .replace(/\.\d{3}Z$/, ' UTC');

  const txCount = block.body.txEffects.length;

  const finalizationStatus = block.finalizationStatus === 3 ? 'finalized' : 'pending';

  const blockData = [
    {
      title: 'block hash',
      data: block.hash,
    },
    {
      title: 'block height',
      data: blockHeight,
    },
    {
      title: 'timestamp',
      data: formattedTimestamp,
    },
    {
      title: 'finalization status',
      data: finalizationStatus,
    },
    {
      title: 'transaction count',
      data: txCount,
    },
    {
      title: 'slot number',
      data: block.header.globalVariables.slotNumber,
    },
    {
      title: 'total fees',
      data: block.header.totalFees,
    },
    {
      title: 'total mana used',
      data: block.header.totalManaUsed,
    },
    {
      title: 'chain id',
      data: block.header.globalVariables.chainId,
    },
    {
      title: 'protocol version',
      data: block.header.globalVariables.version,
    },
    {
      title: 'block producer',
      data: block.header.globalVariables.coinbase,
    },
    {
      title: 'fee recipient',
      data: block.header.globalVariables.feeRecipient,
    },
  ];

  const formatData = (title: string, data: number | string) => {
    switch (title) {
      case 'block hash':
        return (
          <div className="flex items-center gap-2">
            <span className="break-all font-handjet text-lg">{data}</span>
            <CopyButton value={data.toString()} />
          </div>
        );
      case 'block height':
        return <div className="font-handjet text-lg text-highlight">{data.toLocaleString('en-US')}</div>;
      case 'timestamp':
        return (
          <div className="flex items-center gap-2">
            <span className="font-handjet text-lg">{data}</span>
            <CopyButton value={data.toString()} />
          </div>
        );
      case 'finalization status':
        return (
          <div className="flex items-center gap-2">
            <div
              className={`rounded-full px-6 py-1 font-handjet text-lg shadow-button ${
                data === 'finalized' ? 'bg-primary' : 'bg-secondary'
              }`}
            >
              {t(data as 'finalized' | 'pending')}
            </div>
          </div>
        );
      case 'transaction count':
        return <div className="font-handjet text-lg">{data.toLocaleString('en-US')}</div>;
      case 'total fees':
      case 'total mana used':
        return <div className="font-handjet text-lg">{data.toLocaleString('en-US')}</div>;
      case 'block producer':
      case 'fee recipient':
        return (
          <div className="flex items-center gap-2">
            <span className="break-all font-handjet text-lg">{data}</span>
            <CopyButton value={data.toString()} />
          </div>
        );
      default:
        return <div className="font-handjet text-lg">{data}</div>;
    }
  };

  return (
    <div className="mt-2">
      <div className="mb-8 ml-5 flex justify-between">
        <div className="flex flex-row">
          <div className="mr-5 flex">
            <Tooltip tooltip={t('block icon tooltip')} direction={'bottom'}>
              <div className="h-24 min-h-24 w-24 min-w-24 bg-hash_txs bg-contain bg-no-repeat hover:bg-hash_txs_h" />
            </Tooltip>
          </div>
          <div className="flex flex-col justify-center">
            <div className="mb-1 flex flex-row text-center font-handjet text-lg">
              <div
                className={`mr-6 rounded-full px-6 shadow-button ${
                  finalizationStatus === 'finalized' ? 'bg-primary' : 'bg-secondary'
                }`}
              >
                {t(finalizationStatus as 'finalized' | 'pending')}
              </div>
              <div className="rounded-full bg-secondary px-6 shadow-button">
                {t('block')} #{blockHeight.toLocaleString('en-US')}
              </div>
            </div>
            <div className="flex items-end justify-end font-handjet text-lg">
              {block.hash}
              <CopyButton value={block.hash} size="md" />
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <RoundedButton href={`/networks/${chain?.name}/blocks`} className="mb-4 font-handjet text-lg active:mb-3">
            {t('show all blocks')}
          </RoundedButton>
        </div>
      </div>
      {blockData.map((item) => (
        <div key={item.title} className="mt-2 flex w-full hover:bg-bgHover">
          <div className="w-3/12 items-center border-b border-r border-bgSt py-4 pl-11 font-sfpro text-lg">
            {t(item.title as 'block hash')}
          </div>
          <div className="flex w-9/12 cursor-pointer items-center gap-2 border-b border-bgSt py-4 pl-6 pr-4 font-sfpro text-base hover:text-highlight">
            {formatData(item.title, item.data)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default BlockInformation;
