import { Chain } from '@prisma/client';
import { getTranslations } from 'next-intl/server';
import { FC } from 'react';
import { txExample } from '@/app/networks/[id]/tx/txExample';
import CopyButton from '@/components/common/copy-button';

interface OwnProps {
  chain?: Chain;
}

const ExpandedTxInformation: FC<OwnProps> = async ({ chain }) => {
  const t = await getTranslations('TxInformationPage');

  const formatData = (title: string, data: number | string | string[]) => {
    switch (title) {
      case 'amount':
        return <div className="font-handjet text-lg hover:text-highlight">{data} {chain?.denom ?? 'ATOM'}</div>;
      case 'delegate address':
        return (
          <div>
            {typeof data === 'string' ? (
              <div className="flex flex-row justify-center items-center hover:text-highlight">
                {data} <CopyButton value={data} size={'md'} />
              </div>
            ) : null}
          </div>
        );
      case 'validator address':
        return (
          <div>
            {Array.isArray(data)
              ? data.map((item, index) =>
                <div className="hover:text-highlight" key={index}>{item}</div>)
              : data}
          </div>
        );
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
            {t(`${item.title as 'delegate address'}`)}
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
