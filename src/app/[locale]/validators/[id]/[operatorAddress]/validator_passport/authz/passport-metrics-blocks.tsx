import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import MetricsCardItem from '@/components/common/metrics-cards/metrics-card-item';
import Tooltip from '@/components/common/tooltip';
import RoundedButton from '@/components/common/rounded-button';
import aztecDbService from '@/services/aztec-db-service';
import { NodeWithValidatorAndChain } from '@/services/node-service';

interface OwnProps {
  node: NodeWithValidatorAndChain | null;
}

const PassportMetricsBlocks: FC<OwnProps> = async ({ node }) => {
  const t = await getTranslations('ValidatorPassportPage');

  if (!node) {
    return null;
  }

  const isAztec = ['aztec', 'aztec-testnet'].includes(node.chain.name);
  const stakedEvent = isAztec
    ? await aztecDbService.getStakedEventByAttester(node.operatorAddress, node.chain.name)
    : null;

  const tokensDelegated =
    node.chain.params?.coinDecimals != null ? +node.delegatorShares / 10 ** node.chain.params?.coinDecimals : undefined;

  const tokenDelegatedMetric = tokensDelegated
    ? `${tokensDelegated.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${node.chain.params?.denom}`
    : '';

  const outstandingRewards =
    node.chain.params?.coinDecimals != null && node.outstandingRewards != null && node.outstandingCommissions != null
      ? `${(
          (+node.outstandingRewards - +node.outstandingCommissions) /
          10 ** node.chain.params?.coinDecimals
        ).toLocaleString('en-US', { maximumFractionDigits: 2 })} 
      ${node.chain.params.denom}`
      : '-';

  const outstandingCommission =
    node.chain.params?.coinDecimals != null && node.outstandingCommissions
      ? `${(+node.outstandingCommissions / 10 ** node.chain.params?.coinDecimals).toLocaleString('en-US', { maximumFractionDigits: 2 })} 
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
            data={expectedApr?.toFixed(2) ?? 'N/A'}
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
            data={votingPower?.toFixed(2) ?? 'N/A'}
            className={cardClass}
            dataClassName={cardValueClass}
            isPercents
          />
          <MetricsCardItem title={t('validator rank')} data="N/A" className={cardClass} dataClassName={cardValueClass} />
          <MetricsCardItem
            title={t('proposals created')}
            data="N/A"
            className={cardClass}
            dataClassName={cardValueClass}
          />
          <MetricsCardItem
            title={t('outstanding commission')}
            data={outstandingCommission}
            className={cardClass}
            dataClassName={cardValueClass}
          />
          {isAztec && (
            <Tooltip
              tooltip={
                stakedEvent?.timestamp?.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                }) ?? ''
              }
            >
              <MetricsCardItem
                title={t('activation date')}
                data={stakedEvent?.happened ?? '-'}
                className={cardClass}
                dataClassName={cardValueClass}
              />
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  );
};

export default PassportMetricsBlocks;
