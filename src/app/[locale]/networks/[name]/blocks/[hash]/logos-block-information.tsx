import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { FC } from 'react';

import CopyButton from '@/components/common/copy-button';
import RoundedButton from '@/components/common/rounded-button';
import Tooltip from '@/components/common/tooltip';
import logosIndexer from '@/services/logos-indexer-api';
import { ChainWithParams } from '@/services/chain-service';

interface OwnProps {
  chain: ChainWithParams | null;
  hash: string;
}

const LogosBlockInformation: FC<OwnProps> = async ({ chain, hash }) => {
  const t = await getTranslations('BlockInformationPage');

  let block;
  try {
    block = await logosIndexer.getBlock(hash, { revalidate: false });
  } catch (error) {
    console.error('Error fetching Logos block:', error);
    notFound();
  }

  if (!block) {
    notFound();
  }

  const indexedAt = new Date(block.indexed_at);
  const formattedTimestamp = indexedAt.toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, ' UTC');
  const finalizationLabel = block.finalized ? 'finalized' : 'pending';
  const heightLabel = block.height ?? `slot ${block.slot}`;

  const blockData: Array<{ title: string; data: string | number }> = [
    { title: 'block hash', data: block.id },
    { title: 'slot number', data: block.slot },
    { title: 'block height', data: block.height ?? '—' },
    { title: 'parent block', data: block.parent_block },
    { title: 'finalization status', data: finalizationLabel },
    { title: 'transaction count', data: block.tx_count },
    { title: 'leader key', data: block.leader_key },
    { title: 'voucher commitment', data: block.voucher_cm },
    { title: 'entropy', data: block.entropy },
    { title: 'block root', data: block.block_root },
    { title: 'indexed at', data: formattedTimestamp },
  ];

  const renderValue = (title: string, data: string | number) => {
    const isHash =
      title === 'block hash' ||
      title === 'parent block' ||
      title === 'leader key' ||
      title === 'voucher commitment' ||
      title === 'entropy' ||
      title === 'block root';

    if (title === 'finalization status') {
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
    }

    if (isHash && typeof data === 'string') {
      return (
        <div className="flex items-center gap-2">
          <span className="break-all font-handjet text-lg">{data}</span>
          <CopyButton value={data} />
        </div>
      );
    }

    return <div className="font-handjet text-lg">{data}</div>;
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
                  block.finalized ? 'bg-primary' : 'bg-secondary'
                }`}
              >
                {t(finalizationLabel as 'finalized' | 'pending')}
              </div>
              <div className="rounded-full bg-secondary px-6 shadow-button">
                {t('block')} #{heightLabel}
              </div>
            </div>
            <div className="flex items-end justify-end font-handjet text-lg">
              {block.id}
              <CopyButton value={block.id} size="md" />
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
            {renderValue(item.title, item.data)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default LogosBlockInformation;
