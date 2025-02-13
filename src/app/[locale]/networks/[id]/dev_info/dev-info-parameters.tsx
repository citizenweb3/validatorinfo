import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import { networkProfileExample } from '@/app/networks/[id]/networkProfileExample';
import SubTitle from '@/components/common/sub-title';
import CopyButton from '@/components/common/copy-button';

interface OwnProps {
}

const DevInfoParameters: FC<OwnProps> = async () => {
  const t = await getTranslations('NetworkDevInfo');

  const formatData = (title: string, data: number | string) => {
    switch (title) {
      case 'chain id':
      case 'denom':
        return <>{data}<CopyButton value={String(data)} size="md" /></>;
      default:
        return data;
    }
  };

  const formatStyle = (title: string) => {
    switch (title) {
      case 'slip44':
      case 'key algosz':
        return 'font-handjet text-lg';
      case 'genesis url':
        return 'underline underline-offset-4'
      default:
        return '';
    }
  };

  return (
    <>
      <SubTitle text={t('Parameters')} />
      {networkProfileExample.parameters.map((item) => (
        <div key={item.title} className="mt-2 flex w-full hover:bg-bgHover">
          <div className="w-1/4 items-center border-b border-r border-bgSt py-4 pl-6 font-sfpro text-base ">
            {t(`${item.title as 'bech32 prefix'}`)}
          </div>
          <div
            className={`${formatStyle(item.title)} flex w-3/4 cursor-pointer items-center gap-2 border-b border-bgSt py-4 pl-6 text-base hover:text-highlight`}>
            {formatData(item.title, item.data)}
          </div>
        </div>
      ))}
    </>
  );
};

export default DevInfoParameters;
