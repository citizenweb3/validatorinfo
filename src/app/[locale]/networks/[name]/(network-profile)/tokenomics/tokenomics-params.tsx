'use client';

import { FC, ReactNode, useState } from 'react';

import MetricsCardItem from '@/components/common/metrics-cards/metrics-card-item';
import Switch from '@/components/common/switch';
import Tooltip from '@/components/common/tooltip';
import formatCash from '@/utils/format-cash';

interface OwnProps {
  communityPool: number;
  rewardsInTokens: number | undefined;
  pendingUndelegations: number | undefined;
  fdv: number | undefined;
  tvs: number;
  inflation: number;
  circulatingTokensPercent: number | undefined;
  tokenPriceValue: number | null;
  denom: string;
  translations: {
    communityPoolTvl: string;
    tokensStaked: string;
    rewardToPayout: string;
    inflationRate: string;
    circulatingTokens: string;
    pendingUndelegations: string;
    fdv: string;
    token: string;
  };
}

const TokenomicsParams: FC<OwnProps> = ({
    communityPool,
    rewardsInTokens,
    pendingUndelegations,
    fdv,
    tvs,
    inflation,
    circulatingTokensPercent,
    tokenPriceValue,
    denom,
    translations: t,
  }) => {
  const [isToken, setIsToken] = useState(false);
  const hasPrice = tokenPriceValue != null && tokenPriceValue > 0;
  const price = tokenPriceValue ?? 0;
  const isUsd = !isToken;

  const hasCommunityPool = communityPool > 0;
  const hasTvs = tvs > 0;
  const hasRewards = rewardsInTokens !== undefined && rewardsInTokens > 0;
  const hasInflation = inflation > 0;
  const hasCirculating = circulatingTokensPercent !== undefined && circulatingTokensPercent > 0;
  const hasPending = pendingUndelegations !== undefined && pendingUndelegations > 0;
  const hasFdv = fdv !== undefined && fdv > 0;

  const formatTokenValue = (tokens: number): ReactNode => (
    <Tooltip tooltip={tokens.toLocaleString()}>
      <div className="text-center">{formatCash(tokens)} {denom}</div>
    </Tooltip>
  );

  const formatUsdValue = (usd: number): ReactNode => (
    <Tooltip tooltip={`$${usd.toLocaleString()}`}>
      <div className="text-center">${formatCash(usd)}</div>
    </Tooltip>
  );

  const communityPoolData = hasPrice && isUsd
    ? formatUsdValue(communityPool * price)
    : formatTokenValue(communityPool);

  const rewardsData = rewardsInTokens !== undefined
    ? hasPrice && isUsd
      ? formatUsdValue(rewardsInTokens * price)
      : formatTokenValue(rewardsInTokens)
    : '-';

  const pendingData = pendingUndelegations !== undefined
    ? hasPrice && isUsd
      ? formatUsdValue(pendingUndelegations * price)
      : formatTokenValue(pendingUndelegations)
    : undefined;

  const fdvData = fdv
    ? hasPrice && !isUsd
      ? formatTokenValue(fdv / price)
      : formatUsdValue(fdv)
    : '-';

  return (
    <>
      {hasPrice && (
        <div className="flex items-center gap-2 justify-end">
          <div className="border-b border-bgSt px-2 font-handjet text-lg">USD</div>
          <Switch value={isToken} onChange={(value) => setIsToken(value)} />
          <div className="border-b border-bgSt px-2 font-handjet text-lg">{t.token}</div>
        </div>
      )}

      <div className="grid grid-cols-[repeat(2,auto)] md:grid-cols-[repeat(4,auto)] gap-6 justify-center w-full mt-6">
        <MetricsCardItem
          title={t.communityPoolTvl}
          data={hasCommunityPool ? communityPoolData : 12}
          className="pb-8 pt-2.5"
          dataClassName={`mt-6 ${!hasCommunityPool ? 'blur-sm' : ''}`}
        />
        <MetricsCardItem
          title={t.tokensStaked}
          data={hasTvs ? `${(tvs * 100).toFixed(2)}%` : 12}
          className="pb-8 pt-2.5"
          dataClassName={`mt-6 ${!hasTvs ? 'blur-sm' : ''}`}
        />
        <MetricsCardItem
          title={t.rewardToPayout}
          data={hasRewards ? rewardsData : 12}
          className="pb-8 pt-2.5"
          dataClassName={`mt-6 ${!hasRewards ? 'blur-sm' : ''}`}
        />
        <MetricsCardItem
          title={t.inflationRate}
          data={hasInflation ? `${(inflation * 100).toFixed(2)}%` : 98}
          className="pb-8 pt-2.5"
          dataClassName={`mt-6 ${!hasInflation ? 'blur-sm' : ''}`}
        />
        <MetricsCardItem
          title={t.circulatingTokens}
          data={hasCirculating ? `${circulatingTokensPercent!.toFixed(2)}%` : 12}
          className="pb-8 pt-2.5"
          dataClassName={`mt-6 ${!hasCirculating ? 'blur-sm' : ''}`}
        />
        <MetricsCardItem
          title={t.pendingUndelegations}
          data={hasPending ? pendingData : 12}
          className="pb-8 pt-2.5"
          dataClassName={`mt-6 ${!hasPending ? 'blur-sm' : ''}`}
        />
        <MetricsCardItem
          title={t.fdv}
          data={hasFdv ? fdvData : 98}
          className="pb-8 pt-2.5"
          dataClassName={`mt-6 ${!hasFdv ? 'blur-sm' : ''}`}
        />
      </div>
    </>
  );
};

export default TokenomicsParams;
