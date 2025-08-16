import { getTranslations } from 'next-intl/server';
import { FC } from 'react';
import { txExample } from '@/app/networks/[id]/tx/txExample';
import CopyButton from '@/components/common/copy-button';
import { ChainWithParams } from '@/services/chain-service';
import Link from 'next/link';

interface OwnProps {
  chain: ChainWithParams | null;
}

const ExpandedTxInformation: FC<OwnProps> = async ({ chain }) => {
  const t = await getTranslations('TxInformationPage');

  const formatData = (title: string, data: number | string | string[]) => {
    switch (title) {
      case 'amount':
        return <div className="font-handjet text-lg hover:text-highlight">{data} {chain?.params?.denom ?? 'ATOM'}</div>;
      case 'delegate address':
        return (
          <div className="flex flex-row items-center gap-2 hover:text-highlight">
            <Link href={`/networks/${chain?.id}/address/${data}/passport`} className="text-highlight hover:underline">
              {data}
            </Link>
            <CopyButton value={data} size={'md'} />
          </div>
        );
      case 'validator address':
        if (Array.isArray(data) && data.length > 1) {
          const address = data[0];
          const valName = data[1];
          return (
            <div className="flex flex-col gap-1">
              <div className="flex flex-row items-center gap-2">
                <Link href={`/networks/${chain?.id}/address/${address}/passport`}
                      className="text-highlight hover:underline">
                  {address}
                </Link>
                <CopyButton value={address} size={'md'} />
              </div>
              <Link href={`/validators?search=${encodeURIComponent(valName)}`}
                    className="text-highlight hover:underline">
                {valName}
              </Link>
            </div>
          );
        } else {
          return (
            <div className="flex flex-row items-center gap-2">
              <Link href={`/networks/${chain?.id}/address/${data}/passport`} className="text-highlight hover:underline">
                {data}
              </Link>
              <CopyButton value={data} size={'md'} />
            </div>
          );
        }
      case 'auto claim reward':
        return (
          <div>
            {Array.isArray(data)
              ? data.map((item, index) =>
                <div className="text-lg font-handjet hover:text-highlight" key={index}>{item}</div>)
              : data}
          </div>
        );
      default:
        return <div className="hover:text-highlight">{data}</div>;
    }
  };

  return (
    <div className="mt-5 mb-5">
      {txExample.expanded.map((item) => (
        <div key={item.title} className="mt-2 flex w-full hover:bg-bgHover">
          <div className="w-3/12 items-center border-b border-r border-bgSt py-4 pl-8 font-sfpro text-lg ">
            {item.title === 'delegate address' ? 'Delegator Address' : t(`${item.title as 'delegate address'}`)}
          </div>
          <div
            className="flex w-9/12 cursor-pointer items-center gap-2 border-b border-bgSt py-4 pl-6 pr-4 font-sfpro text-base">
            {formatData(item.title, item.data)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExpandedTxInformation;
