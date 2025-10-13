import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { FC } from 'react';

import { txExample } from '@/app/networks/[name]/tx/txExample';
import CopyButton from '@/components/common/copy-button';
import RoundedButton from '@/components/common/rounded-button';
import Tooltip from '@/components/common/tooltip';
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
            {data.toLocaleString('en-En')}
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
