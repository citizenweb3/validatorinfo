import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { FC } from 'react';

import CopyButton from '@/components/common/copy-button';
import RoundedButton from '@/components/common/rounded-button';
import Tooltip from '@/components/common/tooltip';
import { getMoneroTransaction } from '@/server/tools/chains/monero/indexer-client';
import { ChainWithParams } from '@/services/chain-service';
import { bigIntSafeCache } from '@/utils/bigint-safe-cache';
import cutHash from '@/utils/cut-hash';
import { formatXmrReward } from '@/utils/monero';

interface OwnProps {
  chain: ChainWithParams;
  hash: string;
}

// Tx-by-hash is immutable (no mutable attribution on this page) — cache the indexer payload 1h.
const getCachedTransaction = bigIntSafeCache(
  (hash: string) => getMoneroTransaction(hash),
  ['monero-tx-detail'],
  { revalidate: 3600 },
);

const formatBytes = (bytes: number): string => {
  if (!bytes) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const MoneroTxInformation: FC<OwnProps> = async ({ chain, hash }) => {
  const t = await getTranslations('TxInformationPage');

  const tx = await getCachedTransaction(hash).catch(() => null);

  if (!tx) {
    return (
      <div className="mt-2">
        <div className="mb-8 ml-5 flex justify-between">
          <div className="flex flex-row">
            <div className="mr-5 flex">
              <Tooltip tooltip={t('hash txs tooltip')} direction={'bottom'}>
                <div className="h-24 min-h-24 w-24 min-w-24 bg-hash_txs bg-contain bg-no-repeat hover:bg-hash_txs_h" />
              </Tooltip>
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-end justify-end font-handjet text-lg">
                {cutHash({ value: hash, cutLength: 16 })}
                <CopyButton value={hash} size="md" />
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <RoundedButton href={`/networks/${chain.name}/tx`} className="mb-4 font-handjet text-lg active:mb-3">
              {t('show all transactions')}
            </RoundedButton>
          </div>
        </div>
        <div className="flex flex-col items-center gap-4 py-12">
          <div className="font-sfpro text-lg">{t('tx not found')}</div>
          <div className="font-sfpro text-base text-gray-400">{t('tx not found hint')}</div>
        </div>
      </div>
    );
  }

  const typeLabel = tx.isCoinbase ? t('coinbase') : t('regular');
  const txData: { title: string; data: string | number }[] = [
    { title: 'chain', data: chain.prettyName },
    { title: 'block height', data: tx.blockHeight },
    { title: 'block hash', data: tx.blockHash },
    { title: 'index in block', data: tx.position },
    { title: 'type', data: typeLabel },
    { title: 'inputs', data: tx.inputsCount },
    { title: 'outputs', data: tx.outputsCount },
    { title: 'fees', data: formatXmrReward(tx.fee) },
    { title: 'size', data: formatBytes(tx.size) },
    { title: 'ring version', data: tx.version },
    { title: 'unlock time', data: tx.unlockTime },
    { title: 'confirmations', data: tx.confirmations },
  ];

  const formatData = (title: string, data: number | string) => {
    switch (title) {
      case 'chain':
        return (
          <Link href={`/networks/${chain.name}/overview`} className="hover:text-highlight hover:underline">
            {data}
          </Link>
        );
      case 'block height':
        return (
          <Link
            href={`/networks/${chain.name}/blocks/${tx.blockHash}`}
            className="font-handjet text-lg hover:text-highlight hover:underline"
          >
            {Number(data).toLocaleString('en-US')}
          </Link>
        );
      case 'block hash':
        return (
          <div className="flex items-center gap-2">
            <Link
              href={`/networks/${chain.name}/blocks/${data}`}
              className="break-all font-handjet text-lg hover:text-highlight hover:underline"
            >
              {data}
            </Link>
            <CopyButton value={data.toString()} />
          </div>
        );
      case 'index in block':
      case 'inputs':
      case 'outputs':
      case 'confirmations':
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
            <Tooltip tooltip={t('hash txs tooltip')} direction={'bottom'}>
              <div className="h-24 min-h-24 w-24 min-w-24 bg-hash_txs bg-contain bg-no-repeat hover:bg-hash_txs_h" />
            </Tooltip>
          </div>
          <div className="flex flex-col justify-center">
            <div className="mb-1 flex flex-row text-center font-handjet text-lg">
              <div className={`mr-6 rounded-full px-6 shadow-button ${tx.isCoinbase ? 'bg-primary' : 'bg-secondary'}`}>
                {typeLabel}
              </div>
            </div>
            <div className="flex items-end justify-end font-handjet text-lg">
              {cutHash({ value: tx.hash, cutLength: 16 })}
              <CopyButton value={tx.hash} size="md" />
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <RoundedButton href={`/networks/${chain.name}/tx`} className="mb-4 font-handjet text-lg active:mb-3">
            {t('show all transactions')}
          </RoundedButton>
        </div>
      </div>
      <p className="mb-2 ml-5 font-sfpro text-sm opacity-70">{t('amounts hidden')}</p>
      {txData.map((item) => (
        <div key={item.title} className="mt-2 flex w-full hover:bg-bgHover">
          <div className="w-3/12 items-center border-b border-r border-bgSt py-4 pl-11 font-sfpro text-lg">
            {t(item.title as 'chain')}
          </div>
          <div className="flex w-9/12 cursor-pointer items-center gap-2 border-b border-bgSt py-4 pl-6 pr-4 font-sfpro text-base hover:text-highlight">
            {formatData(item.title, item.data)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MoneroTxInformation;
