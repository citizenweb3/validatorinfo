import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { FC } from 'react';

import { txExample } from '@/app/networks/[name]/tx/txExample';
import CopyButton from '@/components/common/copy-button';
import RoundedButton from '@/components/common/rounded-button';
import Tooltip from '@/components/common/tooltip';
import { isAztecChainName } from '@/server/tools/chains/aztec/utils/contracts/contracts-config';
import { AztecDroppedTx, AztecPendingTx, AztecTxEffect } from '@/services/aztec-indexer-api/types';
import TxService, { TxStatus } from '@/services/tx-service';
import { ChainWithParams } from '@/services/chain-service';
import { formatTimestamp } from '@/utils/format-timestamp';
import cutHash from '@/utils/cut-hash';

interface OwnProps {
  chain: ChainWithParams | null;
  hash: string;
}

const getStatusLabel = (status: TxStatus) => {
  switch (status) {
    case 'confirmed':
      return { labelKey: 'accepted' as const, className: 'bg-secondary' };
    case 'pending':
      return { labelKey: 'pending' as const, className: 'bg-yellow-600' };
    case 'dropped':
      return { labelKey: 'dropped' as const, className: 'bg-primary' };
  }
};

const TxInformation: FC<OwnProps> = async ({ chain, hash }) => {
  const t = await getTranslations('TxInformationPage');

  if (chain && isAztecChainName(chain.name)) {
    const result = await TxService.getAztecTxByHash(hash);

    if (!result) {
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
                  {hash}
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

    const { status, data } = result;
    const statusInfo = getStatusLabel(status);

    // Build txData based on status
    let txData: { title: string; data: string | number }[] = [];

    if (status === 'confirmed') {
      const txEffect = data as AztecTxEffect;
      txData = [
        { title: 'chain', data: chain.prettyName },
        { title: 'block height', data: String(txEffect.blockHeight) },
        { title: 'timestamp', data: txEffect.timestamp ? formatTimestamp(new Date(txEffect.timestamp)) : '-' },
        { title: 'fees', data: chain.params?.coinDecimals != null
            ? (Number(txEffect.transactionFee) / 10 ** chain.params.coinDecimals).toLocaleString('en-US', { maximumSignificantDigits: 3 })
            : String(txEffect.transactionFee) },
        { title: 'revert code', data: txEffect.revertCode.code === 0 ? 'Success (0)' : `Reverted (${txEffect.revertCode.code})` },
        ...(txEffect.index != null ? [{ title: 'index in block', data: txEffect.index }] : []),
        { title: 'note hashes', data: `${txEffect.noteHashes.length} hash(es)` },
        { title: 'nullifiers', data: `${txEffect.nullifiers.length} nullifier(s)` },
        { title: 'l2 to l1 messages', data: `${txEffect.l2ToL1Msgs.length} message(s)` },
      ];
    } else if (status === 'pending') {
      const pendingTx = data as AztecPendingTx;
      txData = [
        { title: 'chain', data: chain.prettyName },
        { title: 'status', data: 'Pending (in mempool)' },
        { title: 'fee payer', data: cutHash({ value: pendingTx.feePayer, cutLength: 16 }) },
        { title: 'timestamp', data: pendingTx.birthTimestamp ? formatTimestamp(new Date(pendingTx.birthTimestamp)) : '-' },
      ];
    } else {
      const droppedTx = data as AztecDroppedTx;
      txData = [
        { title: 'chain', data: chain.prettyName },
        { title: 'status', data: 'Dropped' },
        { title: 'submitted at', data: droppedTx.createdAsPendingAt ? formatTimestamp(new Date(droppedTx.createdAsPendingAt)) : '-' },
        { title: 'dropped at', data: droppedTx.droppedAt ? formatTimestamp(new Date(droppedTx.droppedAt)) : '-' },
      ];
    }

    const formatAztecData = (title: string, data: number | string) => {
      switch (title) {
        case 'chain':
          return <Link href={`/networks/${chain.name}/overview`} className="hover:text-highlight hover:underline">{data}</Link>;
        case 'block height':
          return (
            <Link
              href={`/networks/${chain.name}/blocks/${data}`}
              className="font-handjet text-lg hover:text-highlight hover:underline"
            >
              {Number(data).toLocaleString('en-US')}
            </Link>
          );
        case 'timestamp':
        case 'submitted at':
        case 'dropped at':
          return <div className="font-sfpro text-base">{data}</div>;
        case 'fees':
          return <div className="font-handjet text-lg">{data} AZTEC</div>;
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
                <div className={`mr-6 rounded-full px-6 shadow-button ${statusInfo.className}`}>
                  {t(statusInfo.labelKey)}
                </div>
              </div>
              <div className="flex items-end justify-end font-handjet text-lg">
                {hash}
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
        {txData.map((item) => (
          <div key={item.title} className="mt-2 flex w-full hover:bg-bgHover">
            <div className="w-3/12 items-center border-b border-r border-bgSt py-4 pl-11 font-sfpro text-lg">
              {t(item.title as 'chain')}
            </div>
            <div className="flex w-9/12 cursor-pointer items-center gap-2 border-b border-bgSt py-4 pl-6 pr-4 font-sfpro text-base hover:text-highlight">
              {formatAztecData(item.title, item.data)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Non-Aztec: existing Cosmos mock data
  const formatData = (title: string, data: number | string) => {
    switch (title) {
      case 'chain':
        return <Link href={`/networks/${chain?.name}/overview`}>{chain?.prettyName ?? data}</Link>;
      case 'chain id':
        return (
          <div className="flex items-center gap-2">
            {chain?.chainId ?? data}
            <CopyButton value={chain?.name ?? data} />
          </div>
        );
      case 'fees':
        return (
          <div className="font-handjet text-lg">
            {data} {chain?.params?.denom ?? 'ATOM'}
          </div>
        );
      case 'block height':
        return (
          <Link
            href={`/networks/${chain?.name}/block/${data}`}
            className="font-handjet text-lg text-highlight hover:underline"
          >
            {data.toLocaleString('en-US')}
          </Link>
        );
      case 'timestamp':
        return (
          <div className="flex items-center gap-2">
            {data}
            <CopyButton value={data} />
          </div>
        );
      case 'memo':
        return (
          <div className="flex items-center gap-2">
            {data}
            <CopyButton value={data} />
          </div>
        );
      default:
        return data;
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
              <div className="mr-6 rounded-full bg-primary px-6 shadow-button">{t('claim reward')}</div>
              <div className="rounded-full bg-secondary px-6 shadow-button">{t('accepted')}</div>
            </div>
            <div className="flex items-end justify-end font-handjet text-lg">
              {hash}
              <CopyButton value={hash} size="md" />
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <RoundedButton href={`/networks/${chain?.name}/tx`} className="mb-4 font-handjet text-lg active:mb-3">
            {t('show all transactions')}
          </RoundedButton>
        </div>
      </div>
      {txExample.transaction.map((item) => (
        <div key={item.title} className="mt-2 flex w-full hover:bg-bgHover">
          <div className="w-3/12 items-center border-b border-r border-bgSt py-4 pl-11 font-sfpro text-lg ">
            {t(`${item.title as 'chain'}`)}
          </div>
          <div className="flex w-9/12 cursor-pointer items-center gap-2 border-b border-bgSt py-4 pl-6 pr-4 font-sfpro text-base hover:text-highlight">
            {formatData(item.title, item.data)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TxInformation;
