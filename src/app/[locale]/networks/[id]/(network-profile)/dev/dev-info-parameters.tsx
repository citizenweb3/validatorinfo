import { getTranslations } from 'next-intl/server';
import { FC } from 'react';
import SubTitle from '@/components/common/sub-title';
import CopyButton from '@/components/common/copy-button';
import { Chain } from '@prisma/client';

interface OwnProps {
  chain?: Chain;
}

const DevInfoParameters: FC<OwnProps> = async ({ chain }) => {
  const t = await getTranslations('NetworkDevInfo');

  return (
    <div className="mt-12">
      <SubTitle text={t('Parameters')} />
      <div className="mt-4 flex w-full hover:bg-bgHover">
        <div className="w-1/4 items-center border-b border-r border-bgSt py-6 pl-6 font-sfpro text-lg">
          {t('bech32 prefix')}
        </div>
        <div className="flex w-3/4 cursor-pointer items-center gap-2 border-b border-bgSt py-6 pl-6 text-base hover:text-highlight">
          {chain?.bech32Prefix}
        </div>
      </div>
      <div className="mt-4 flex w-full hover:bg-bgHover">
        <div className="w-1/4 items-center border-b border-r border-bgSt py-6 pl-6 font-sfpro text-lg">
          {t('daemon name')}
        </div>
        <div className="flex w-3/4 cursor-pointer items-center gap-2 border-b border-bgSt py-6 pl-6 text-base hover:text-highlight">
          {chain?.daemonName}
        </div>
      </div>
      <div className="mt-4 flex w-full hover:bg-bgHover">
        <div className="w-1/4 items-center border-b border-r border-bgSt py-6 pl-6 font-sfpro text-lg">
          {t('node home')}
        </div>
        <div className="flex w-3/4 cursor-pointer items-center gap-2 border-b border-bgSt py-6 pl-6 text-base hover:text-highlight">
          {chain?.nodeHome}
        </div>
      </div>
      <div className="mt-4 flex w-full hover:bg-bgHover">
        <div className="w-1/4 items-center border-b border-r border-bgSt py-6 pl-6 font-sfpro text-lg">
          {t('slip44')}
        </div>
        <div className="font-handjet text-lg flex w-3/4 cursor-pointer items-center gap-2 border-b border-bgSt py-6 pl-6 hover:text-highlight">
          {chain?.coinType}
        </div>
      </div>
      <div className="mt-4 flex w-full hover:bg-bgHover">
        <div className="w-1/4 items-center border-b border-r border-bgSt py-6 pl-6 font-sfpro text-lg">
          {t('key algosz')}
        </div>
        <div className="font-handjet text-lg flex w-3/4 cursor-pointer items-center gap-2 border-b border-bgSt py-6 pl-6 hover:text-highlight">
          {chain?.keyAlgos ? JSON.parse(chain?.keyAlgos)[0] : ''}
        </div>
      </div>
      <div className="mt-4 flex w-full hover:bg-bgHover">
        <div className="w-1/4 items-center border-b border-r border-bgSt py-6 pl-6 font-sfpro text-lg">
          {t('genesis url')}
        </div>
        <div className="underline underline-offset-4 flex w-3/4 cursor-pointer items-center gap-2 border-b border-bgSt py-6 pl-6 text-base hover:text-highlight">
          {chain?.genesis ? JSON.parse(chain?.genesis) : ''}
        </div>
      </div>
      <div className="mt-4 flex w-full hover:bg-bgHover">
        <div className="w-1/4 items-center border-b border-r border-bgSt py-6 pl-6 font-sfpro text-lg">
          {t('chain id')}
        </div>
        <div className="flex w-3/4 cursor-pointer items-center gap-2 border-b border-bgSt py-6 pl-6 text-base hover:text-highlight">
          {chain?.chainId}<CopyButton value={String(chain?.chainId)} size="md" />
        </div>
      </div>
      <div className="mt-4 flex w-full hover:bg-bgHover">
        <div className="w-1/4 items-center border-b border-r border-bgSt py-6 pl-6 font-sfpro text-lg">
          {t('denom')}
        </div>
        <div className="flex w-3/4 cursor-pointer items-center gap-2 border-b border-bgSt py-6 pl-6 text-base hover:text-highlight">
          {chain?.denom}<CopyButton value={String(chain?.denom)} size="md" />
        </div>
      </div>
    </div>
  );
};

export default DevInfoParameters;
