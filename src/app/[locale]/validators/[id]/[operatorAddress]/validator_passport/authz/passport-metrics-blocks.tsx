import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import { validatorNodesWithChainData } from '@/services/validator-service';
import MetricsCardItem from '@/components/common/metrics-cards/metrics-card-item';

interface OwnProps {
  node?: validatorNodesWithChainData | undefined;
}

const PassportMetricsBlocks: FC<OwnProps> = async ({ node }) => {
  const t = await getTranslations('ValidatorPassportPage');

  if (!node) {
    return null;
  }

  const tokensDelegated = +node.delegatorShares / 10 ** node.chain.coinDecimals;
  const tokenDelegatedMetric = `${tokensDelegated.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${node.chain.denom}`;
  const votingPower = +node.delegatorShares / +node.chain.bondedTokens * 100;
  const expectedApr = (+node.chain.apr - (+node.chain.apr * +node.rate)) * 100;

  const cardClass = 'pt-3 pb-3';
  const cardValueClass = 'my-5';

  return (
    <div className="mt-12 flex flex-col items-center gap-8">
      <div className="flex gap-8">
        <MetricsCardItem title={t('commission')}
                         data={Math.trunc(Number(node.rate) * 100)}
                         className="pt-2.5 pb-3"
                         dataClassName={cardValueClass}
                         isPercents
        />
        <MetricsCardItem title={t('tokens delegated')}
                         data={tokenDelegatedMetric}
                         className={cardClass}
                         dataClassName={cardValueClass}
        />
        <MetricsCardItem title={t('expected APR')}
                         data={expectedApr.toFixed(2)}
                         className={cardClass}
                         dataClassName={cardValueClass}
                         isPercents
        />
        <MetricsCardItem title={t('outstanding reward')}
                         data="12.56K"
                         className={cardClass}
                         dataClassName={cardValueClass}
        />
      </div>
      <div className="flex gap-8">
        <MetricsCardItem title={t('voting power')}
                         data={votingPower.toFixed(2)}
                         className={cardClass}
                         dataClassName={cardValueClass}
                         isPercents
        />
        <MetricsCardItem title={t('validator rank')}
                         data="17"
                         className={cardClass}
                         dataClassName={cardValueClass}
        />
        <MetricsCardItem title={t('proposals created')}
                         data="2"
                         className={cardClass}
                         dataClassName={cardValueClass}
        />
      </div>
    </div>
  );
};

export default PassportMetricsBlocks;
