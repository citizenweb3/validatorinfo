import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import SubTitle from '@/components/common/sub-title';
import TokenomicsParams from '@/app/networks/[name]/(network-profile)/tokenomics/tokenomics-params';
import PowTokenomicsParams from '@/app/networks/[name]/(network-profile)/tokenomics/pow-tokenomics-params';
import { ChainWithParamsAndTokenomics } from '@/services/chain-service';

interface OwnProps {
  chain: ChainWithParamsAndTokenomics | null;
  tokenPriceValue: number | null;
}

const DistributionGiniParameters: FC<OwnProps> = async ({ chain, tokenPriceValue }) => {
  const t = await getTranslations('NetworkTokenomics');
  const isPow = chain?.consensusType === 'pow';
  const fdv = chain?.name === 'ethereum-sepolia' || chain?.name === 'warden-testnet' ? 0 : chain?.tokenomics?.fdv;

  const communityPool =
    chain?.params?.coinDecimals != null
      ? Number(chain?.tokenomics?.communityPool) / 10 ** Number(chain.params.coinDecimals)
      : 0;

  const rewardsInTokens =
    chain?.tokenomics?.rewardsToPayout && chain?.params?.coinDecimals != null
      ? Number(chain?.tokenomics?.rewardsToPayout) / 10 ** Number(chain.params.coinDecimals)
      : undefined;

  const pendingUndelegations =
    chain?.tokenomics?.unbondingTokens && chain?.params?.coinDecimals != null
      ? Number(chain?.tokenomics?.unbondingTokens) / 10 ** Number(chain.params.coinDecimals)
      : undefined;

  const circulatingTokensPercent =
    chain?.tokenomics?.circulatingTokensPublic && chain?.tokenomics?.totalSupply
      ? (+chain?.tokenomics?.circulatingTokensPublic / +chain?.tokenomics?.totalSupply) * 100
      : chain?.tokenomics?.circulatingTokensOnchain && chain?.tokenomics?.totalSupply
        ? (+chain?.tokenomics?.circulatingTokensOnchain / +chain?.tokenomics?.totalSupply) * 100
        : undefined;

  const giniValue = 69;

  return (
    <div className="mb-12">
      <SubTitle className={"mb-20"} text={t('Gini Coefficient')} />
      <div className="mt-6 w-[80%] mx-auto blur-sm pointer-events-none">
        <div className="relative h-10 w-full overflow-hidden rounded-sm bg-table_row">
          <div
            className="h-full rounded-sm transition-all duration-500"
            style={{
              width: `${giniValue}%`,
              background: 'linear-gradient(90deg, #E5C46B 0%, #4FB848 100%)',
            }}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 font-handjet text-xl text-highlight">
            {(giniValue / 100).toFixed(2)}%
          </span>
        </div>
        <div className="mt-2 flex flex-col items-start gap-2 font-sfpro text-base">
          <div>{t('number of validators')}</div>
          <div className="font-handjet text-lg text-highlight">
            N/A
          </div>
        </div>
      </div>

      <SubTitle className={"mt-20 mb-8"} text={t('Params')} />
      {isPow ? (
        <PowTokenomicsParams chainName={chain?.name ?? null} />
      ) : (
        <TokenomicsParams
          communityPool={communityPool}
          rewardsInTokens={rewardsInTokens}
          pendingUndelegations={pendingUndelegations}
          fdv={fdv}
          tvs={Number(chain?.tokenomics?.tvs)}
          inflation={Number(chain?.tokenomics?.inflation)}
          circulatingTokensPercent={circulatingTokensPercent}
          tokenPriceValue={tokenPriceValue}
          denom={chain?.params?.denom ?? ''}
          translations={{
            communityPoolTvl: t('community pool tvl'),
            tokensStaked: t('% of tokens staked'),
            rewardToPayout: t('reward to payout'),
            inflationRate: t('inflation rate'),
            circulatingTokens: t('circulating tokens %'),
            pendingUndelegations: t('pending undelegations'),
            fdv: t('fdv'),
            token: t('Token'),
          }}
        />
      )}
    </div>
  );
};

export default DistributionGiniParameters;
