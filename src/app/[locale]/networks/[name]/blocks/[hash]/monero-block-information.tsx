import { getTranslations } from 'next-intl/server';
import { unstable_noStore as noStore } from 'next/cache';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FC } from 'react';

import CopyButton from '@/components/common/copy-button';
import RoundedButton from '@/components/common/rounded-button';
import Tooltip from '@/components/common/tooltip';
import { getMoneroBlockDetail } from '@/server/tools/chains/monero/indexer-client';
import { ChainWithParams } from '@/services/chain-service';
import { getPoolByBlockHashes } from '@/services/monero-service';
import { bigIntSafeCache } from '@/utils/bigint-safe-cache';
import cutHash from '@/utils/cut-hash';
import { formatTimestamp } from '@/utils/format-timestamp';
import { formatXmrReward } from '@/utils/monero';

interface OwnProps {
  chain: ChainWithParams;
  hash: string;
}

// Block-by-hash is immutable — cache the indexer payload for 1h across requests.
const getCachedBlockDetail = bigIntSafeCache(
  (hash: string) => getMoneroBlockDetail(hash),
  ['monero-block-detail'],
  { revalidate: 3600 },
);

const formatBytes = (bytes: number): string => {
  if (!bytes) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const MoneroBlockInformation: FC<OwnProps> = async ({ chain, hash }) => {
  const t = await getTranslations('BlockInformationPage');

  // Pool attribution (getPoolByBlockHashes) lands after a block is first seen, so keep this
  // render dynamic — a frozen full-route cache would pin "Mined By" to Unidentified.
  noStore();

  const block = await getCachedBlockDetail(hash).catch(() => null);
  if (!block) notFound();

  const poolMap = await getPoolByBlockHashes([block.hash]);
  const poolName = poolMap.get(block.hash)?.name ?? t('unknown pool');

  const blockData: { title: string; data: string | number }[] = [
    { title: 'block hash', data: block.hash },
    { title: 'block height', data: block.height },
    { title: 'timestamp', data: formatTimestamp(new Date(block.timestamp * 1000)) },
    { title: 'mining pool', data: poolName },
    { title: 'transaction count', data: block.txCount },
    { title: 'block reward', data: formatXmrReward(block.reward) },
    { title: 'size', data: formatBytes(block.size) },
    { title: 'weight', data: block.weight.toLocaleString('en-US') },
    { title: 'difficulty', data: block.difficulty != null ? block.difficulty.toLocaleString('en-US') : '-' },
    { title: 'version', data: `${block.majorVersion}.${block.minorVersion}` },
    { title: 'nonce', data: block.nonce },
    { title: 'previous block', data: block.prevHash },
    { title: 'miner tx hash', data: block.minerTxHash },
  ];

  const formatData = (title: string, data: number | string) => {
    switch (title) {
      case 'block hash':
      case 'miner tx hash':
        return (
          <div className="flex items-center gap-2">
            <span className="break-all font-handjet text-lg">{data}</span>
            <CopyButton value={data.toString()} />
          </div>
        );
      case 'previous block':
        return (
          <Link
            href={`/networks/${chain.name}/blocks/${data}`}
            className="break-all font-handjet text-lg hover:text-highlight hover:underline"
          >
            {data}
          </Link>
        );
      case 'block height':
        return <div className="font-handjet text-lg text-highlight">{Number(data).toLocaleString('en-US')}</div>;
      case 'mining pool':
        return <div className="font-handjet text-lg text-highlight">{data}</div>;
      case 'transaction count':
      case 'nonce':
        return <div className="font-handjet text-lg">{Number(data).toLocaleString('en-US')}</div>;
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
              <div className="rounded-full bg-secondary px-6 shadow-button">
                {t('block')} #{block.height.toLocaleString('en-US')}
              </div>
            </div>
            <div className="flex items-end justify-end font-handjet text-lg">
              {cutHash({ value: block.hash, cutLength: 16 })}
              <CopyButton value={block.hash} size="md" />
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <RoundedButton href={`/networks/${chain.name}/blocks`} className="mb-4 font-handjet text-lg active:mb-3">
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

export default MoneroBlockInformation;
