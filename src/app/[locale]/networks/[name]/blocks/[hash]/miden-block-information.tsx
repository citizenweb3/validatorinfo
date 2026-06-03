import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { FC } from 'react';

import CopyButton from '@/components/common/copy-button';
import RoundedButton from '@/components/common/rounded-button';
import Tooltip from '@/components/common/tooltip';
import { ChainWithParams } from '@/services/chain-service';
import midenIndexer from '@/services/miden-indexer-api';

interface OwnProps {
  chain: ChainWithParams | null;
  hash: string;
}

const HASH_FIELDS = new Set([
  'block hash',
  'parent commitment',
  'chain commitment',
  'account root',
  'nullifier root',
  'note root',
  'tx commitment',
  'tx kernel commitment',
  'validator key',
  'native asset id',
]);

const NUMBER_FIELDS = new Set(['block number', 'tx count', 'note count', 'nullifier count', 'version']);

const MidenBlockInformation: FC<OwnProps> = async ({ chain, hash }) => {
  const t = await getTranslations('BlockInformationPage');

  let block;
  try {
    block = await midenIndexer.getBlock(hash, { revalidate: false });
  } catch (error) {
    console.error('Error fetching Miden block:', error);
    notFound();
  }

  if (!block) {
    notFound();
  }

  const timestamp = new Date(block.timestamp);
  const formattedTimestamp = Number.isFinite(timestamp.getTime())
    ? timestamp.toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, ' UTC')
    : '—';
  const blockNumber = Number(block.block_num);

  const blockData: Array<{ title: string; data: string | number }> = [
    { title: 'block hash', data: block.block_hash },
    { title: 'block number', data: blockNumber },
    { title: 'parent commitment', data: block.prev_block_commitment },
    { title: 'chain commitment', data: block.chain_commitment },
    { title: 'account root', data: block.account_root },
    { title: 'nullifier root', data: block.nullifier_root },
    { title: 'note root', data: block.note_root },
    { title: 'tx commitment', data: block.tx_commitment },
    { title: 'validator key', data: block.validator_key },
    { title: 'tx kernel commitment', data: block.tx_kernel_commitment },
    { title: 'native asset id', data: block.native_asset_id },
    { title: 'verification base fee', data: block.verification_base_fee },
    { title: 'timestamp', data: formattedTimestamp },
    { title: 'tx count', data: block.tx_count },
    { title: 'note count', data: block.note_count },
    { title: 'nullifier count', data: block.nullifier_count },
    { title: 'version', data: block.version },
  ];

  const renderValue = (title: string, data: string | number) => {
    if (HASH_FIELDS.has(title) && typeof data === 'string') {
      return (
        <div className="flex items-center gap-2">
          <span className="break-all font-handjet text-lg">{data}</span>
          <CopyButton value={data} />
        </div>
      );
    }

    if (title === 'timestamp' && typeof data === 'string') {
      return (
        <div className="flex items-center gap-2">
          <span className="font-handjet text-lg">{data}</span>
          <CopyButton value={data} />
        </div>
      );
    }

    if (NUMBER_FIELDS.has(title) && typeof data === 'number') {
      return <div className="font-handjet text-lg">{data.toLocaleString('en-US')}</div>;
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
              <div className="mr-6 rounded-full bg-primary px-6 shadow-button">
                {t('finalized')}
              </div>
              <div className="rounded-full bg-secondary px-6 shadow-button">
                {t('block')} #{blockNumber.toLocaleString('en-US')}
              </div>
            </div>
            <div className="flex items-end justify-end font-handjet text-lg">
              {block.block_hash}
              <CopyButton value={block.block_hash} size="md" />
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

export default MidenBlockInformation;
