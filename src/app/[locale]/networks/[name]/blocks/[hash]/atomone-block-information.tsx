import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { FC } from 'react';

import CopyButton from '@/components/common/copy-button';
import RoundedButton from '@/components/common/rounded-button';
import Tooltip from '@/components/common/tooltip';
import atomoneIndexer from '@/services/atomone-indexer-api';
import { ChainWithParams } from '@/services/chain-service';

interface OwnProps {
  chain: ChainWithParams | null;
  hash: string;
}

const AtomoneBlockInformation: FC<OwnProps> = async ({ chain, hash }) => {
  const t = await getTranslations('BlockInformationPage');

  if (!/^\d+$/.test(hash)) {
    notFound();
  }

  let block;
  try {
    const response = await atomoneIndexer.getBlockByHeight(hash, { revalidate: false });
    block = response?.data;
  } catch (error) {
    console.error('Error fetching AtomOne block:', error);
    notFound();
  }

  if (!block) {
    notFound();
  }

  const time = new Date(block.time);
  const formattedTimestamp = time.toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, ' UTC');
  const heightNumber = Number(block.height);

  const blockData: Array<{ title: string; data: string | number }> = [
    { title: 'block hash', data: block.block_hash },
    { title: 'block height', data: heightNumber },
    { title: 'timestamp', data: formattedTimestamp },
    { title: 'proposer address', data: block.proposer_address },
    { title: 'transaction count', data: block.tx_count },
    { title: 'size bytes', data: block.size_bytes ?? '—' },
    { title: 'last commit hash', data: block.last_commit_hash ?? '—' },
    { title: 'app hash', data: block.app_hash ?? '—' },
    { title: 'evidence count', data: block.evidence_count },
  ];

  const renderValue = (title: string, data: string | number) => {
    const isHash =
      title === 'block hash' ||
      title === 'proposer address' ||
      title === 'last commit hash' ||
      title === 'app hash';

    if (title === 'block height') {
      return (
        <div className="font-handjet text-lg text-highlight">
          {typeof data === 'number' ? data.toLocaleString('en-US') : data}
        </div>
      );
    }

    if (title === 'timestamp') {
      return (
        <div className="flex items-center gap-2">
          <span className="font-handjet text-lg">{data}</span>
          <CopyButton value={data.toString()} />
        </div>
      );
    }

    if (isHash && typeof data === 'string' && data !== '—') {
      return (
        <div className="flex items-center gap-2">
          <span className="break-all font-handjet text-lg">{data}</span>
          <CopyButton value={data} />
        </div>
      );
    }

    if (typeof data === 'number') {
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
              <div className="mr-6 rounded-full bg-primary px-6 shadow-button">{t('finalized')}</div>
              <div className="rounded-full bg-secondary px-6 shadow-button">
                {t('block')} #{heightNumber.toLocaleString('en-US')}
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

export default AtomoneBlockInformation;
