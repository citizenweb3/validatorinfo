import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { FC } from 'react';

import CopyButton from '@/components/common/copy-button';
import RoundedButton from '@/components/common/rounded-button';
import Tooltip from '@/components/common/tooltip';
import { ChainWithParams } from '@/services/chain-service';
import TxService from '@/services/tx-service';

interface OwnProps {
  chain: ChainWithParams;
  hash: string;
}

const HASH_FIELDS = new Set([
  'account id',
  'account id bech32',
  'init account state',
  'final account state',
  'input notes commitment',
  'output notes commitment',
]);

const NUMBER_FIELDS = new Set(['block height', 'expiration block num']);

const EMPTY = '—';

const formatTimestamp = (iso: string): string => {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) {
    return EMPTY;
  }
  return d.toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, ' UTC');
};

const MidenTxInformation: FC<OwnProps> = async ({ chain, hash }) => {
  const t = await getTranslations('TxInformationPage');

  const result = await TxService.getMidenTxByHash(hash);

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
          <div className="font-sfpro text-base text-bgSt">{t('tx not found hint')}</div>
        </div>
      </div>
    );
  }

  const { data: tx } = result;

  const blockHeightRaw = Number(tx.block_num);
  const blockHeight = Number.isFinite(blockHeightRaw) ? blockHeightRaw : null;
  const inputNullifiersCount = tx.input_nullifiers?.length ?? 0;
  const outputNoteIdsCount = tx.output_note_ids?.length ?? 0;

  const txData: Array<{ title: string; data: string | number | null }> = [
    { title: 'chain', data: chain.prettyName },
    { title: 'block height', data: blockHeight },
    { title: 'account id', data: tx.account_id },
    { title: 'account id bech32', data: tx.account_id_bech32 },
    { title: 'init account state', data: tx.init_account_state },
    { title: 'final account state', data: tx.final_account_state },
    { title: 'input notes commitment', data: tx.input_notes_commitment },
    { title: 'output notes commitment', data: tx.output_notes_commitment },
    { title: 'expiration block num', data: tx.expiration_block_num },
    {
      title: 'input nullifiers',
      data: inputNullifiersCount > 0 ? t('items count', { count: inputNullifiersCount }) : EMPTY,
    },
    {
      title: 'output note ids',
      data: outputNoteIdsCount > 0 ? t('items count', { count: outputNoteIdsCount }) : EMPTY,
    },
    { title: 'timestamp', data: tx.block_timestamp ? formatTimestamp(tx.block_timestamp) : EMPTY },
    { title: 'inserted at', data: formatTimestamp(tx.inserted_at) },
  ];

  const renderValue = (title: string, data: string | number | null) => {
    if (title === 'chain') {
      return (
        <Link href={`/networks/${chain.name}/overview`} className="hover:text-highlight hover:underline">
          {data}
        </Link>
      );
    }

    if (title === 'block height') {
      if (data !== null && typeof data === 'number') {
        return (
          <Link
            href={`/networks/${chain.name}/blocks/${data}`}
            className="font-handjet text-lg hover:text-highlight hover:underline"
          >
            {data.toLocaleString('en-US')}
          </Link>
        );
      }
      return <div className="font-handjet text-lg">{EMPTY}</div>;
    }

    if (data === null) {
      return <div className="font-handjet text-lg">{EMPTY}</div>;
    }

    if (HASH_FIELDS.has(title) && typeof data === 'string') {
      return (
        <div className="flex items-center gap-2">
          <span className="break-all font-handjet text-lg">{data}</span>
          <CopyButton value={data} />
        </div>
      );
    }

    if ((title === 'timestamp' || title === 'inserted at') && typeof data === 'string') {
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
            <Tooltip tooltip={t('hash txs tooltip')} direction={'bottom'}>
              <div className="h-24 min-h-24 w-24 min-w-24 bg-hash_txs bg-contain bg-no-repeat hover:bg-hash_txs_h" />
            </Tooltip>
          </div>
          <div className="flex flex-col justify-center">
            <div className="mb-1 flex flex-row text-center font-handjet text-lg">
              <div className="rounded-full bg-secondary px-6 shadow-button">{t('accepted')}</div>
            </div>
            <div className="flex items-end justify-end font-handjet text-lg">
              {tx.tx_id}
              <CopyButton value={tx.tx_id} size="md" />
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
            {renderValue(item.title, item.data)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MidenTxInformation;
