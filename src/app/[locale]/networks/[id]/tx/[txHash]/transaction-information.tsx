import { Chain } from '@prisma/client';
import { getTranslations } from 'next-intl/server';
import { FC } from 'react';
import { txExample } from '@/app/networks/[id]/tx/txExample';
import Tooltip from '@/components/common/tooltip';
import CopyButton from '@/components/common/copy-button';
import RoundedButton from '@/components/common/rounded-button';

interface OwnProps {
  chain?: Chain;
  txHash: string;
}

const TransactionInformation: FC<OwnProps> = async ({ chain, txHash }) => {
  const t = await getTranslations('TxInformationPage');

  const formatData = (title: string, data: number | string) => {
    switch (title) {
      case 'chain':
        return chain?.prettyName ?? data;
      case 'chain id':
        return chain?.chainId ?? data;
      case 'fees':
        return <div className="font-handjet text-lg">{data} {chain?.denom ?? 'ATOM'}</div>;
      case 'block height':
        return <div className="font-handjet text-lg">{data.toLocaleString('en-En')}</div>;
      default:
        return data;
    }
  };

  return (
    <div className="mt-5 mb-5">
      <div className="flex justify-between">
        <div className="flex flex-row">
          <div className="flex">
            <Tooltip tooltip={t('hash txs tooltip')} direction={'bottom'}>
              <div
                className="h-24 min-h-24 w-24 min-w-24 bg-contain bg-no-repeat ml-3 bg-hash_txs hover:bg-hash_txs_h" />
            </Tooltip>
          </div>
          <div className="flex flex-col">
            <div className="flex flex-row font-handjet text-lg text-center">
              <div className="rounded-full bg-primary shadow-button m-2 px-4">{t('claim reward')}</div>
              <div className="rounded-full bg-secondary shadow-button m-2 px-4">{t('accepted')}</div>
            </div>
            <div className="flex justify-end items-end text-lg font-handjet">
              {txHash}
              <CopyButton value={txHash} size="md" />
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <RoundedButton href={`/networks/${chain?.id}/tx`} className="font-handjet text-base mb-4 active:mb-3">
            {t('show all transactions')}
          </RoundedButton>
        </div>

      </div>

      {txExample.transaction.map((item) => (
        <div key={item.title} className="mt-2 flex w-full hover:bg-bgHover">
          <div className="w-1/3 items-center border-b border-r border-bgSt py-4 pl-8 font-sfpro text-lg ">
            {t(`${item.title as 'chain'}`)}
          </div>
          <div
            className="flex w-2/3 cursor-pointer items-center gap-2 border-b border-bgSt py-4 pl-6 pr-4 font-sfpro text-base hover:text-highlight">
            {formatData(item.title, item.data)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TransactionInformation;
