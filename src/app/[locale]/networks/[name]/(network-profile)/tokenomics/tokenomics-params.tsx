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
          data={communityPoolData}
          className="pb-8 pt-2.5"
          dataClassName="mt-6"
        />
        <MetricsCardItem
          title={t.tokensStaked}
          data={`${(tvs * 100).toFixed(2)}%`}
          className="pb-8 pt-2.5"
          dataClassName="mt-6"
        />
        <MetricsCardItem
          title={t.rewardToPayout}
          data={rewardsData}
          className="pb-8 pt-2.5"
          dataClassName="mt-6"
        />
        <MetricsCardItem
          title={t.inflationRate}
          data={`${(inflation * 100).toFixed(2)}%`}
          className="pb-8 pt-2.5"
          dataClassName="mt-6"
        />
        {circulatingTokensPercent !== undefined && (
          <MetricsCardItem
            title={t.circulatingTokens}
            data={`${circulatingTokensPercent.toFixed(2)}%`}
            className="pb-8 pt-2.5"
            dataClassName="mt-6"
          />
        )}
        {pendingData !== undefined && (
          <MetricsCardItem
            title={t.pendingUndelegations}
            data={pendingData}
            className="pb-8 pt-2.5"
            dataClassName="mt-6"
          />
        )}
        <MetricsCardItem
          title={t.fdv}
          data={fdvData}
          className="pb-8 pt-2.5"
          dataClassName="mt-6"
        />
      </div>
    </>
  );
};

export default TokenomicsParams;
