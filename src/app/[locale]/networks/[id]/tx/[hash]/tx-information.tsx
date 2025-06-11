import { getTranslations } from 'next-intl/server';
import { FC } from 'react';
import { txExample } from '@/app/networks/[id]/tx/txExample';
import Tooltip from '@/components/common/tooltip';
import CopyButton from '@/components/common/copy-button';
import RoundedButton from '@/components/common/rounded-button';
import Link from 'next/link';
import { ChainWithParams } from '@/services/chain-service';

interface OwnProps {
  chain: ChainWithParams | null;
  hash: string;
}

const TxInformation: FC<OwnProps> = async ({ chain, hash }) => {
  const t = await getTranslations('TxInformationPage');

  const formatData = (title: string, data: number | string) => {
    switch (title) {
      case 'chain':
        return (
          <Link href={`/networks/${chain?.id}/overview`}>
            {chain?.prettyName ?? data}
          </Link>
        );
      case 'chain id':
        return (
          <Link href={`/networks/${chain?.id}/overview`}>
            {chain?.chainId ?? data}
          </Link>
        );
      case 'fees':
        return <div className="font-handjet text-lg">
          {data} {chain?.params?.denom ?? 'ATOM'}
        </div>;
      case 'block height':
        return <div className="font-handjet text-lg">{data.toLocaleString('en-En')}</div>;
      default:
        return data;
    }
  };

  return (
    <div className="mt-2">
      <div className="flex justify-between mb-8 ml-5">
        <div className="flex flex-row">
          <div className="flex mr-5">
            <Tooltip tooltip={t('hash txs tooltip')} direction={'bottom'}>
              <div className="h-24 min-h-24 w-24 min-w-24 bg-contain bg-no-repeat bg-hash_txs hover:bg-hash_txs_h" />
            </Tooltip>
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex flex-row font-handjet text-lg text-center mb-1">
              <div className="rounded-full bg-primary shadow-button px-6 mr-6">{t('claim reward')}</div>
              <div className="rounded-full bg-secondary shadow-button px-6">{t('accepted')}</div>
            </div>
            <div className="flex justify-end items-end text-lg font-handjet">
              {hash}
              <CopyButton value={hash} size="md" />
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <RoundedButton href={`/networks/${chain?.id}/tx`} className="font-handjet text-lg mb-4 active:mb-3">
            {t('show all transactions')}
          </RoundedButton>
        </div>
      </div>
      {txExample.transaction.map((item) => (
        <div key={item.title} className="mt-2 flex w-full hover:bg-bgHover">
          <div className="w-3/12 items-center border-b border-r border-bgSt py-4 pl-11 font-sfpro text-lg ">
            {t(`${item.title as 'chain'}`)}
          </div>
          <div
            className="flex w-9/12 cursor-pointer items-center gap-2 border-b border-bgSt py-4 pl-6 pr-4 font-sfpro text-base hover:text-highlight">
            {formatData(item.title, item.data)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TxInformation;
