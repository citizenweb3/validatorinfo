import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { FC, ReactNode } from 'react';

import CopyButton from '@/components/common/copy-button';
import RoundedButton from '@/components/common/rounded-button';
import Tooltip from '@/components/common/tooltip';
import { ChainWithParams } from '@/services/chain-service';
import TxService from '@/services/tx-service';

interface OwnProps {
  chain: ChainWithParams | null;
  hash: string;
}

const formatAtomoneTimestamp = (iso: string): string =>
  new Date(iso).toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, ' UTC');

const AtomoneTxInformation: FC<OwnProps> = async ({ chain, hash }) => {
  const t = await getTranslations('TxInformationPage');
  const result = await TxService.getAtomoneTxByHash(hash);

  if (!result || !chain) {
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
          {chain && (
            <div className="flex items-center">
              <RoundedButton href={`/networks/${chain.name}/tx`} className="mb-4 font-handjet text-lg active:mb-3">
                {t('show all transactions')}
              </RoundedButton>
            </div>
          )}
        </div>
        <div className="flex flex-col items-center gap-4 py-12">
          <div className="font-sfpro text-lg">{t('tx not found')}</div>
          <div className="font-sfpro text-base text-gray-400">{t('tx not found hint')}</div>
        </div>
      </div>
    );
  }

  const { status, data: tx } = result;
  const statusInfo =
    status === 'confirmed'
      ? { labelKey: 'accepted' as const, className: 'bg-secondary' }
      : { labelKey: 'failed' as const, className: 'bg-primary' };
  const heightNumber = Number(tx.height);
  const formattedFee = tx.fee?.amount?.length
    ? tx.fee.amount.map((a) => `${a.amount} ${a.denom}`).join(', ')
    : '—';
  const signersList = tx.signers && tx.signers.length > 0 ? tx.signers : null;

  const txData: Array<{ title: string; value: ReactNode }> = [
    {
      title: 'chain',
      value: (
        <Link href={`/networks/${chain.name}/overview`} className="hover:text-highlight hover:underline">
          {chain.prettyName}
        </Link>
      ),
    },
    {
      title: 'block height',
      value: (
        <Link
          href={`/networks/${chain.name}/blocks/${heightNumber}`}
          className="font-handjet text-lg hover:text-highlight hover:underline"
        >
          {heightNumber.toLocaleString('en-US')}
        </Link>
      ),
    },
    {
      title: 'index in block',
      value: <div className="font-handjet text-lg">{tx.tx_index}</div>,
    },
    {
      title: 'timestamp',
      value: (
        <div className="flex items-center gap-2">
          <span className="font-handjet text-lg">{formatAtomoneTimestamp(tx.time)}</span>
          <CopyButton value={formatAtomoneTimestamp(tx.time)} />
        </div>
      ),
    },
    {
      title: 'code',
      value: (
        <div className="font-handjet text-lg">
          {tx.code === 0 ? `${t('success')} (0)` : `${t('reverted')} (${tx.code})`}
        </div>
      ),
    },
    {
      title: 'gas wanted',
      value: (
        <div className="font-handjet text-lg">
          {tx.gas_wanted ? Number(tx.gas_wanted).toLocaleString('en-US') : '—'}
        </div>
      ),
    },
    {
      title: 'gas used',
      value: (
        <div className="font-handjet text-lg">
          {tx.gas_used ? Number(tx.gas_used).toLocaleString('en-US') : '—'}
        </div>
      ),
    },
    {
      title: 'fees',
      value: <div className="font-handjet text-lg">{formattedFee}</div>,
    },
    ...(signersList
      ? [
          {
            title: 'signers',
            value: (
              <div className="flex flex-col gap-1">
                {signersList.map((signer) => (
                  <div key={signer} className="flex items-center gap-2">
                    <Link
                      href={`/networks/${chain.name}/address/${signer}/passport`}
                      className="break-all font-handjet text-lg text-highlight hover:underline"
                    >
                      {signer}
                    </Link>
                    <CopyButton value={signer} size="md" />
                  </div>
                ))}
              </div>
            ),
          },
        ]
      : []),
    ...(tx.memo
      ? [
          {
            title: 'memo',
            value: (
              <div className="flex items-center gap-2">
                <span className="break-all font-sfpro text-base">{tx.memo}</span>
                <CopyButton value={tx.memo} />
              </div>
            ),
          },
        ]
      : []),
    ...(tx.log_summary
      ? [
          {
            title: 'log summary',
            value: <div className="break-all font-sfpro text-base">{tx.log_summary}</div>,
          },
        ]
      : []),
  ];

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
              {tx.tx_hash}
              <CopyButton value={tx.tx_hash} size="md" />
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
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AtomoneTxInformation;
