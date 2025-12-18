import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import SubTitle from '@/components/common/sub-title';
import { aztecIndexer } from '@/services/aztec-indexer-api';
import chainService, { ChainWithParamsAndTokenomics } from '@/services/chain-service';
import validatorService from '@/services/validator-service';

interface OwnProps {
  chain: ChainWithParamsAndTokenomics | null;
}

const NetworkOverview: FC<OwnProps> = async ({ chain }) => {
  const t = await getTranslations('NetworkPassport');

  const price = chain ? await chainService.getTokenPriceByChainId(chain?.id) : undefined;

  const activeValidators = chain ? await validatorService.getActiveValidatorsByChainId(chain?.id) : undefined;

  const percentOfCommunityPool =
    chain?.tokenomics?.communityPool && chain?.tokenomics?.totalSupply
      ? (+chain.tokenomics.communityPool / +chain.tokenomics.totalSupply) * 100
      : undefined;

  const communityPoolUsd =
    chain?.tokenomics?.communityPool && chain?.params?.coinDecimals != null && price
      ? (+chain.tokenomics.communityPool / Math.pow(10, chain.params.coinDecimals)) * Number(price.value)
      : undefined;

  let aztecAverageBlockTime: number | null = null;
  if (chain?.name === 'aztec') {
    const blockTime = await aztecIndexer.getAverageBlockTime();
    aztecAverageBlockTime = blockTime ? Number(blockTime) / 1000 : null;
  }

  return (
    <div className="mt-5">
      <SubTitle text={t('Network Overview')} />
      {activeValidators && (
        <div className="mt-2 flex w-full hover:bg-bgHover">
          <div className="w-1/3 items-center border-b border-r border-bgSt py-4 pl-8 font-sfpro text-lg">
            {t('active validators')}
          </div>
          <div className="flex w-2/3 cursor-pointer items-center gap-2 border-b border-bgSt py-4 pl-6 pr-4 font-handjet text-lg hover:text-highlight">
            {activeValidators.length}
          </div>
        </div>
      )}
      {chain?.params?.unbondingTime && (
        <div className="mt-2 flex w-full hover:bg-bgHover">
          <div className="w-1/3 items-center border-b border-r border-bgSt py-4 pl-8 font-sfpro text-lg">
            {t('unbonding time')}
          </div>
          <div className="flex w-2/3 cursor-pointer items-center gap-2 border-b border-bgSt py-4 pl-6 pr-4 font-handjet text-lg hover:text-highlight">
            {chain?.params?.unbondingTime ?? '-'}s
          </div>
        </div>
      )}
      {chain?.params?.communityTax !== null && chain?.params?.communityTax !== undefined && (
        <div className="mt-2 flex w-full hover:bg-bgHover">
          <div className="w-1/3 items-center border-b border-r border-bgSt py-4 pl-8 font-sfpro text-lg">
            {t('community tax')}
          </div>
          <div className="flex w-2/3 cursor-pointer items-center gap-2 border-b border-bgSt py-4 pl-6 pr-4 font-handjet text-lg hover:text-highlight">
            {chain?.params?.communityTax * 100}%
          </div>
        </div>
      )}
      {chain?.params?.proposalCreationCost !== null && (
        <div className="mt-2 flex w-full hover:bg-bgHover">
          <div className="w-1/3 items-center border-b border-r border-bgSt py-4 pl-8 font-sfpro text-lg">
            {t('proposal creation cost')}
          </div>
          <div className="flex w-2/3 cursor-pointer items-center gap-2 border-b border-bgSt py-4 pl-6 pr-4 font-handjet text-lg hover:text-highlight">
            {chain?.params?.proposalCreationCost} {chain?.params?.denom}
          </div>
        </div>
      )}
      {chain?.params?.votingPeriod !== null && (
        <div className="mt-2 flex w-full hover:bg-bgHover">
          <div className="w-1/3 items-center border-b border-r border-bgSt py-4 pl-8 font-sfpro text-lg">
            {t('voting period')}
          </div>
          <div className="flex w-2/3 cursor-pointer items-center gap-2 border-b border-bgSt py-4 pl-6 pr-4 font-handjet text-lg hover:text-highlight">
            {chain?.params?.votingPeriod}
          </div>
        </div>
      )}
      {percentOfCommunityPool && (
        <div className="mt-2 flex w-full hover:bg-bgHover">
          <div className="w-1/3 items-center border-b border-r border-bgSt py-4 pl-8 font-sfpro text-lg">
            {t('% of comm pool to total supply')}
          </div>
          <div className="flex w-2/3 cursor-pointer items-center gap-2 border-b border-bgSt py-4 pl-6 pr-4 font-handjet text-lg hover:text-highlight">
            {percentOfCommunityPool.toFixed(2)}%
          </div>
        </div>
      )}
      {communityPoolUsd && (
        <div className="mt-2 flex w-full hover:bg-bgHover">
          <div className="w-1/3 items-center border-b border-r border-bgSt py-4 pl-8 font-sfpro text-lg">
            {t('comm pool value in usd')}
          </div>
          <div className="flex w-2/3 cursor-pointer items-center gap-2 border-b border-bgSt py-4 pl-6 pr-4 font-handjet text-lg hover:text-highlight">
            $
            {communityPoolUsd.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </div>
      )}
      {chain?.params?.jailedDuration && (
        <div className="mt-2 flex w-full hover:bg-bgHover">
          <div className="w-1/3 items-center border-b border-r border-bgSt py-4 pl-8 font-sfpro text-lg">
            {t('slashing')}
          </div>
          <div className="flex w-2/3 cursor-pointer items-center gap-2 border-b border-bgSt py-4 pl-6 pr-4 font-handjet text-lg hover:text-highlight">
            {chain.params.jailedDuration}
          </div>
        </div>
      )}
      {aztecAverageBlockTime ? (
        <>
          <div className="mt-2 flex w-full hover:bg-bgHover">
            <div className="w-1/3 items-center border-b border-r border-bgSt py-4 pl-8 font-sfpro text-lg ">
              {t('average block time')}
            </div>
            <div className="flex w-2/3 cursor-pointer items-center gap-2 border-b border-bgSt py-4 pl-6 pr-4 font-handjet text-lg hover:text-highlight">
              {aztecAverageBlockTime.toFixed(2)}s
            </div>
          </div>
          <div className="mt-2 flex w-full hover:bg-bgHover">
            <div className="w-1/3 items-center border-b border-r border-bgSt py-4 pl-8 font-sfpro text-lg ">
              {t('slot duration')}
            </div>
            <div className="flex w-2/3 cursor-pointer items-center gap-2 border-b border-bgSt py-4 pl-6 pr-4 font-handjet text-lg hover:text-highlight">
              {chain?.avgTxInterval?.toFixed(2) ?? '-'}s
            </div>
          </div>
        </>
      ) : (
        chain?.avgTxInterval && (
          <div className="mt-2 flex w-full hover:bg-bgHover">
            <div className="w-1/3 items-center border-b border-r border-bgSt py-4 pl-8 font-sfpro text-lg ">
              {t('average block time')}
            </div>
            <div className="flex w-2/3 cursor-pointer items-center gap-2 border-b border-bgSt py-4 pl-6 pr-4 font-handjet text-lg hover:text-highlight">
              {chain.avgTxInterval.toFixed(2)}s
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default NetworkOverview;
