import { getTranslations } from 'next-intl/server';
import { FC } from 'react';
import SubTitle from '@/components/common/sub-title';
import CopyButton from '@/components/common/copy-button';
import { ChainWithParams } from '@/services/chain-service';

interface OwnProps {
  chain: ChainWithParams | null;
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
          {chain?.params?.bech32Prefix}
        </div>
      </div>
      <div className="mt-4 flex w-full hover:bg-bgHover">
        <div className="w-1/4 items-center border-b border-r border-bgSt py-6 pl-6 font-sfpro text-lg">
          {t('daemon name')}
        </div>
        <div className="flex w-3/4 cursor-pointer items-center gap-2 border-b border-bgSt py-6 pl-6 text-base hover:text-highlight">
          {chain?.params?.daemonName}
        </div>
      </div>
      <div className="mt-4 flex w-full hover:bg-bgHover">
        <div className="w-1/4 items-center border-b border-r border-bgSt py-6 pl-6 font-sfpro text-lg">
          {t('node home')}
        </div>
        <div className="flex w-3/4 cursor-pointer items-center gap-2 border-b border-bgSt py-6 pl-6 text-base hover:text-highlight">
          {chain?.params?.nodeHome}
        </div>
      </div>
      <div className="mt-4 flex w-full hover:bg-bgHover">
        <div className="w-1/4 items-center border-b border-r border-bgSt py-6 pl-6 font-sfpro text-lg">
          {t('slip44')}
        </div>
        <div className="font-handjet text-lg flex w-3/4 cursor-pointer items-center gap-2 border-b border-bgSt py-6 pl-6 hover:text-highlight">
          {chain?.params?.coinType}
        </div>
      </div>
      <div className="mt-4 flex w-full hover:bg-bgHover">
        <div className="w-1/4 items-center border-b border-r border-bgSt py-6 pl-6 font-sfpro text-lg">
          {t('key algosz')}
        </div>
        <div className="font-handjet text-lg flex w-3/4 cursor-pointer items-center gap-2 border-b border-bgSt py-6 pl-6 hover:text-highlight">
          {chain?.params?.keyAlgos ? JSON.parse(chain?.params?.keyAlgos)[0] : ''}
        </div>
      </div>
      <div className="mt-4 flex w-full hover:bg-bgHover">
        <div className="w-1/4 items-center border-b border-r border-bgSt py-6 pl-6 font-sfpro text-lg">
          {t('genesis url')}
        </div>
        <div className="underline underline-offset-4 flex w-3/4 cursor-pointer items-center gap-2 border-b border-bgSt py-6 pl-6 text-base hover:text-highlight">
          {chain?.params?.genesis ? JSON.parse(chain?.params?.genesis) : ''}
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
          {chain?.params?.denom}<CopyButton value={String(chain?.params?.denom)} size="md" />
        </div>
      </div>
    </div>
  );
};

export default DevInfoParameters;
