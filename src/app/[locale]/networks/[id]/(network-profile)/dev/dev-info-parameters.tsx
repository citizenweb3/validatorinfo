import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import { networkProfileExample } from '@/app/networks/[id]/(network-profile)/networkProfileExample';
import SubTitle from '@/components/common/sub-title';
import CopyButton from '@/components/common/copy-button';
import { Chain } from '@prisma/client';

interface OwnProps {
  chain?: Chain;
}

const DevInfoParameters: FC<OwnProps> = async ({ chain }) => {
  const t = await getTranslations('NetworkDevInfo');

  const formatData = (title: string, data: number | string) => {
    switch (title) {
      case 'chain id':
        return <>{chain?.chainId ?? data}<CopyButton value={String(chain?.chainId ?? data)} size="md" /></>;
      case 'denom':
        return <>{chain?.denom ?? data}<CopyButton value={String(chain?.denom ?? data)} size="md" /></>;
      case 'bech32 prefix':
        return <>{chain?.prettyName ?? data}</>;
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
        return 'underline underline-offset-4';
      default:
        return '';
    }
  };

  return (
    <div className="mt-12">
      <SubTitle text={t('Parameters')} />
      {networkProfileExample.parameters.map((item) => (
        <div key={item.title} className="mt-4 flex w-full hover:bg-bgHover">
          <div className="w-1/4 items-center border-b border-r border-bgSt py-6 pl-6 font-sfpro text-lg">
            {t(`${item.title as 'bech32 prefix'}`)}
          </div>
          <div className={`${formatStyle(item.title)} flex w-3/4 cursor-pointer items-center gap-2 border-b border-bgSt py-6 pl-6 text-base hover:text-highlight`}>
            {formatData(item.title, item.data)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DevInfoParameters;
