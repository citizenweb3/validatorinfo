import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import CopyButton from '@/components/common/copy-button';
import { ChainWithParams } from '@/services/chain-service';
import TxService from '@/services/tx-service';

interface OwnProps {
  chain: ChainWithParams | null;
  hash: string;
}

type ExpandedRowType = 'hash' | 'number' | 'text';

const EMPTY = '—';

const formatTimestamp = (iso?: string): string => {
  if (!iso) {
    return EMPTY;
  }
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) {
    return EMPTY;
  }
  return d.toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, ' UTC');
};

const MidenExpandedTxInformation: FC<OwnProps> = async ({ chain, hash }) => {
  const t = await getTranslations('TxInformationPage');

  if (!chain) {
    return null;
  }

  const result = await TxService.getMidenTxByHash(hash);

  if (!result) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <div className="font-sfpro text-lg">{t('tx not found')}</div>
        <div className="font-sfpro text-base text-bgSt">{t('tx not found hint')}</div>
      </div>
    );
  }

  const tx = result.data;

  const expandedData: Array<{ title: string; data: string | number; type: ExpandedRowType }> = [
    { title: 'account id', data: tx.account_id, type: 'hash' },
    { title: 'account id bech32', data: tx.account_id_bech32, type: 'hash' },
    { title: 'init account state', data: tx.init_account_state, type: 'hash' },
    { title: 'final account state', data: tx.final_account_state, type: 'hash' },
    { title: 'input notes commitment', data: tx.input_notes_commitment, type: 'hash' },
    { title: 'output notes commitment', data: tx.output_notes_commitment, type: 'hash' },
    { title: 'expiration block num', data: tx.expiration_block_num ?? '—', type: 'number' },
    { title: 'timestamp', data: formatTimestamp(tx.block_timestamp), type: 'text' },
  ];

  const formatData = (data: string | number, type: ExpandedRowType) => {
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
    return <div className="font-handjet text-lg hover:text-highlight">{data}</div>;
  };

  const inputNullifiers = tx.input_nullifiers ?? [];
  const outputNoteIds = tx.output_note_ids ?? [];

  const renderListSection = (title: 'input nullifiers' | 'output note ids', items: string[]) => (
    <div key={title} className="mt-4 flex w-full hover:bg-bgHover">
      <div className="w-3/12 items-center border-b border-r border-bgSt py-4 pl-8 font-sfpro text-lg">
        {t(title)} ({items.length})
      </div>
      <div className="flex w-9/12 flex-col gap-1 border-b border-bgSt py-4 pl-6 pr-4">
        {items.length === 0 ? (
          <span className="font-sfpro text-base text-white/50">{t('none')}</span>
        ) : (
          items.map((item, idx) => (
            <div key={`${title}-${idx}`} className="flex items-center gap-2">
              <span className="break-all font-handjet text-lg hover:text-highlight">{item}</span>
              <CopyButton value={item} size="md" />
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="mb-5 mt-5">
      {expandedData.map((item) => (
        <div key={item.title} className="mt-2 flex w-full hover:bg-bgHover">
          <div className="w-3/12 items-center border-b border-r border-bgSt py-4 pl-8 font-sfpro text-lg">
            {t(item.title as 'account id')}
          </div>
          <div className="flex w-9/12 cursor-pointer items-center gap-2 border-b border-bgSt py-4 pl-6 pr-4 font-sfpro text-base">
            {formatData(item.data, item.type)}
          </div>
        </div>
      ))}
      {renderListSection('input nullifiers', inputNullifiers)}
      {renderListSection('output note ids', outputNoteIds)}
    </div>
  );
};

export default MidenExpandedTxInformation;
