import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import MetricsCardItem from '@/components/common/metrics-cards/metrics-card-item';
import SubTitle from '@/components/common/sub-title';
import Tooltip from '@/components/common/tooltip';
import GiniCoefficientSVG from '@/components/customSVG/giniCoefficient';
import TokenDistributionSVG from '@/components/customSVG/tokenDistribution';
import chainService, { ChainWithParamsAndTokenomics } from '@/services/chain-service';
import nodeService from '@/services/node-service';
import formatCash from '@/utils/format-cash';

interface OwnProps {
  chain: ChainWithParamsAndTokenomics | null;
}

const DistributionGiniParameters: FC<OwnProps> = async ({ chain }) => {
  const t = await getTranslations('NetworkTokenomics');

  const nodes = await nodeService.getNodesByChainId(chain?.id ?? 1);

  const totalSupply =
    chain?.params?.coinDecimals && chain?.tokenomics?.totalSupply
      ? +chain?.tokenomics?.totalSupply / 10 ** chain.params?.coinDecimals
      : undefined;

  const tokenPrice = chain ? await chainService.getTokenPriceByChainId(chain.id) : null;
  const fdv = tokenPrice?.value && totalSupply ? totalSupply * tokenPrice.value : undefined;

  const communityPool = Number(chain?.tokenomics?.communityPool) / 10 ** Number(chain?.params?.coinDecimals);

  const rewardsToPayout =
    chain?.tokenomics?.rewardsToPayout && tokenPrice && chain?.params?.coinDecimals
      ? Number(chain?.tokenomics?.rewardsToPayout) / 10 ** Number(chain.params.coinDecimals) / Number(tokenPrice.value)
      : undefined;

  const circulatingTokensPublicPercents =
    chain?.tokenomics?.circulatingTokensPublic && chain?.tokenomics?.totalSupply
      ? (+chain?.tokenomics?.circulatingTokensPublic / +chain?.tokenomics?.totalSupply) * 100
      : undefined;

  const circulatingTokensOnchainPercents =
    chain?.tokenomics?.circulatingTokensOnchain && chain?.tokenomics?.totalSupply
      ? (+chain?.tokenomics?.circulatingTokensOnchain / +chain?.tokenomics?.totalSupply) * 100
      : undefined;

  return (
    <div className="mb-12 mt-6">
      <div className="grid grid-cols-1 gap-y-12 md:grid-cols-2">
        <div className="flex flex-col">
          <SubTitle text={t('Distribution')} />
          <div className="mt-5 flex justify-center md:ml-20 md:justify-start">
            <TokenDistributionSVG Community={40} Team={10} Vc={10} Inflation={40} />
          </div>
        </div>
        <div>
          <SubTitle text={t('Gini Coefficient')} />
          <div className="mt-9 flex flex-row justify-center md:ml-20 md:justify-start">
            <GiniCoefficientSVG value={69} />
            <div className="ml-4 flex flex-col justify-center">
              <div className="font-sfpro text-base">{t('number of validators')}</div>
              <div className="font-handjet text-lg text-highlight">{nodes?.length ?? '234'}</div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-24 flex w-full flex-wrap justify-center gap-6">
        <MetricsCardItem
          title={t('fdv')}
          data={
            fdv ? (
              <Tooltip tooltip={`$${fdv.toLocaleString()}`}>
                <div className="text-center">${formatCash(fdv)}</div>
              </Tooltip>
            ) : (
              '-'
            )
          }
          className="pb-8 pt-2.5"
          dataClassName="mt-6"
        />
        <MetricsCardItem
          title={t('% of tokens staked')}
          data={`${(Number(chain?.tokenomics?.tvs) * 100).toFixed(2)}%`}
          className="pb-8 pt-2.5"
          dataClassName="mt-6"
        />
        <MetricsCardItem
          title={t('community pool tvl')}
          data={
            <Tooltip tooltip={communityPool.toLocaleString()}>
              {`${formatCash(communityPool)} ${chain?.params?.denom}`}
            </Tooltip>
          }
          className="pb-8 pt-2.5"
          dataClassName="mt-6"
        />
        <MetricsCardItem
          title={t('inflation rate')}
          data={`${(Number(chain?.tokenomics?.inflation) * 100).toFixed(2)}%`}
          className="pb-8 pt-2.5"
          dataClassName="mt-6"
        />
        <MetricsCardItem
          title={t('reward to payout')}
          data={
            rewardsToPayout ? (
              <Tooltip tooltip={`$${rewardsToPayout.toLocaleString()}`}>
                <div className="text-center">${formatCash(rewardsToPayout)}</div>
              </Tooltip>
            ) : (
              '-'
            )
          }
          className="pb-8 pt-2.5"
          dataClassName="mt-6"
        />
        {circulatingTokensPublicPercents && (
          <MetricsCardItem
            title={t('circulating tokens public')}
            data={
              <Tooltip className={'font-sfpro text-base'} tooltip={`${t('circulating tokens public tooltip')}`}>
                <div className="text-center">{circulatingTokensPublicPercents.toFixed(2)}%</div>
              </Tooltip>
            }
            className="pb-8 pt-2.5"
            dataClassName="mt-6"
          />
        )}
        {circulatingTokensOnchainPercents && (
          <MetricsCardItem
            title={t('circulating tokens oncain')}
            data={
              <Tooltip className={'font-sfpro text-base'} tooltip={`${t('circulating tokens onchain tooltip')}`}>
                <div className="text-center">{circulatingTokensOnchainPercents.toFixed(2)}%</div>
              </Tooltip>
            }
            className="pb-8 pt-2.5"
            dataClassName="mt-6"
          />
        )}
      </div>
    </div>
  );
};

export default DistributionGiniParameters;
