import { getTranslations } from 'next-intl/server';
import { FC } from 'react';
import SubTitle from '@/components/common/sub-title';
import CopyButton from '@/components/common/copy-button';
import { ChainWithParams } from '@/services/chain-service';
import L1ContractsSection from './l1-contracts-section';

interface OwnProps {
  chain: ChainWithParams | null;
}

const DevInfoParameters: FC<OwnProps> = async ({ chain }) => {
  const t = await getTranslations('NetworkDevInfo');

  const isAztecChain = chain?.name === 'aztec' || chain?.name === 'aztec-testnet';

  return (
    <div className="mt-12">
      <SubTitle text={t('Parameters')} />

      {chain?.params?.bech32Prefix && (
        <div className="mt-4 flex w-full hover:bg-bgHover">
          <div className="w-1/4 items-center border-b border-r border-bgSt py-6 pl-6 font-sfpro text-lg">
            {t('bech32 prefix')}
          </div>
          <div className="flex w-3/4 cursor-pointer items-center gap-2 border-b border-bgSt py-6 pl-6 text-base hover:text-highlight">
            {chain.params.bech32Prefix}
          </div>
        </div>
      )}

      {chain?.params?.daemonName && (
        <div className="mt-4 flex w-full hover:bg-bgHover">
          <div className="w-1/4 items-center border-b border-r border-bgSt py-6 pl-6 font-sfpro text-lg">
            {t('daemon name')}
          </div>
          <div className="flex w-3/4 cursor-pointer items-center gap-2 border-b border-bgSt py-6 pl-6 text-base hover:text-highlight">
            {chain.params.daemonName}
          </div>
        </div>
      )}

      {chain?.params?.nodeHome && (
        <div className="mt-4 flex w-full hover:bg-bgHover">
          <div className="w-1/4 items-center border-b border-r border-bgSt py-6 pl-6 font-sfpro text-lg">
            {t('node home')}
          </div>
          <div className="flex w-3/4 cursor-pointer items-center gap-2 border-b border-bgSt py-6 pl-6 text-base hover:text-highlight">
            {chain.params.nodeHome}
          </div>
        </div>
      )}

      {chain?.params?.coinType !== undefined && (
        <div className="mt-4 flex w-full hover:bg-bgHover">
          <div className="w-1/4 items-center border-b border-r border-bgSt py-6 pl-6 font-sfpro text-lg">
            {t('slip44')}
          </div>
          <div className="flex w-3/4 cursor-pointer items-center gap-2 border-b border-bgSt py-6 pl-6 font-handjet text-lg hover:text-highlight">
            {chain.params.coinType}
          </div>
        </div>
      )}

      {chain?.params?.keyAlgos && (
        <div className="mt-4 flex w-full hover:bg-bgHover">
          <div className="w-1/4 items-center border-b border-r border-bgSt py-6 pl-6 font-sfpro text-lg">
            {t('key algosz')}
          </div>
          <div className="flex w-3/4 cursor-pointer items-center gap-2 border-b border-bgSt py-6 pl-6 font-handjet text-lg hover:text-highlight">
            {JSON.parse(chain.params.keyAlgos)[0]}
          </div>
        </div>
      )}

      {chain?.params?.genesis && (
        <div className="mt-4 flex w-full hover:bg-bgHover">
          <div className="w-1/4 items-center border-b border-r border-bgSt py-6 pl-6 font-sfpro text-lg">
            {t('genesis url')}
          </div>
          <div className="flex w-3/4 cursor-pointer items-center gap-2 border-b border-bgSt py-6 pl-6 text-base underline underline-offset-4 hover:text-highlight">
            {JSON.parse(chain.params.genesis)}
          </div>
        </div>
      )}

      {chain?.chainId && (
        <div className="mt-4 flex w-full hover:bg-bgHover">
          <div className="w-1/4 items-center border-b border-r border-bgSt py-6 pl-6 font-sfpro text-lg">
            {t('chain id')}
          </div>
          <div className="flex w-3/4 cursor-pointer items-center gap-2 border-b border-bgSt py-6 pl-6 text-base hover:text-highlight">
            {chain.chainId}
            <CopyButton value={String(chain.chainId)} size="md" />
          </div>
        </div>
      )}

      {chain?.params?.denom && (
        <div className="mt-4 flex w-full hover:bg-bgHover">
          <div className="w-1/4 items-center border-b border-r border-bgSt py-6 pl-6 font-sfpro text-lg">
            {t('denom')}
          </div>
          <div className="flex w-3/4 cursor-pointer items-center gap-2 border-b border-bgSt py-6 pl-6 text-base hover:text-highlight">
            {chain.params.denom}
            <CopyButton value={String(chain.params.denom)} size="md" />
          </div>
        </div>
      )}

      {isAztecChain && chain?.params && 'l1ContractsAddresses' in chain.params && chain.params.l1ContractsAddresses && (
        <L1ContractsSection contractsJson={chain.params.l1ContractsAddresses as string} chainName={chain.name} />
      )}
    </div>
  );
};

export default DevInfoParameters;
