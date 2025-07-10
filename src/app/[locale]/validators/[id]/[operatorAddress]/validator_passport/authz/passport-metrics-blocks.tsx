import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import MetricsCardItem from '@/components/common/metrics-cards/metrics-card-item';
import RoundedButton from '@/components/common/rounded-button';
import { validatorNodesWithChainData } from '@/services/validator-service';

interface OwnProps {
  node?: validatorNodesWithChainData | undefined;
}

const PassportMetricsBlocks: FC<OwnProps> = async ({ node }) => {
  const t = await getTranslations('ValidatorPassportPage');

  if (!node) {
    return null;
  }

  const tokensDelegated = node.chain.params?.coinDecimals
    ? +node.delegatorShares / 10 ** node.chain.params?.coinDecimals
    : undefined;

  const tokenDelegatedMetric = tokensDelegated
    ? `${tokensDelegated.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${node.chain.params?.denom}`
    : '';

  const outstandingRewards =
    node.chain.params?.coinDecimals && node.outstandingRewards
      ? `${(+node.outstandingRewards / 10 ** node.chain.params?.coinDecimals).toLocaleString('en-US', { maximumFractionDigits: 2 })} 
      ${node.chain.params.denom}`
      : '-';

  const votingPower =
    node.delegatorShares && node.chain?.tokenomics?.bondedTokens
      ? (+node.delegatorShares / +node.chain.tokenomics?.bondedTokens) * 100
      : undefined;

  const expectedApr = node.chain?.tokenomics?.apr
    ? (+node.chain.tokenomics.apr - +node.chain.tokenomics.apr * +node.rate) * 100
    : undefined;

  const cardClass = 'pt-3 pb-3';
  const cardValueClass = 'my-5';

  return (
    <div>
      <div className="flex justify-end">
        <RoundedButton className="font-handjet text-lg">{t('this is my node')}</RoundedButton>
      </div>
      <div className="mt-6 flex flex-col items-center gap-8">
        <div className="flex gap-8">
          <MetricsCardItem
            title={t('commission')}
            data={Math.trunc(Number(node.rate) * 100)}
            className="pb-3 pt-2.5"
            dataClassName={cardValueClass}
            isPercents
          />
          <MetricsCardItem
            title={t('tokens delegated')}
            data={tokenDelegatedMetric}
            className={cardClass}
            dataClassName={cardValueClass}
          />
          <MetricsCardItem
            title={t('expected APR')}
            data={expectedApr?.toFixed(2) ?? '-'}
            className={cardClass}
            dataClassName={cardValueClass}
            isPercents
          />
          <MetricsCardItem
            title={t('outstanding reward')}
            data={outstandingRewards}
            className={cardClass}
            dataClassName={cardValueClass}
          />
        </div>
        <div className="flex gap-8">
          <MetricsCardItem
            title={t('voting power')}
            data={votingPower?.toFixed(2) ?? '-'}
            className={cardClass}
            dataClassName={cardValueClass}
            isPercents
          />
          <MetricsCardItem title={t('validator rank')} data="17" className={cardClass} dataClassName={cardValueClass} />
          <MetricsCardItem
            title={t('proposals created')}
            data="2"
            className={cardClass}
            dataClassName={cardValueClass}
          />
        </div>
      </div>
    </div>
  );
};

export default PassportMetricsBlocks;
