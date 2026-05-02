import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import formatCash from '@/utils/format-cash';
import Tooltip from '@/components/common/tooltip';
import { ChainWithParamsAndTokenomics } from '@/services/chain-service';

interface OwnProps {
  chain: ChainWithParamsAndTokenomics | null;
}

const NetworkStatistics: FC<OwnProps> = async ({ chain }) => {
  const t = await getTranslations('NetworkStatistics');
  const totalStaked = chain?.params?.coinDecimals != null
    ? Number(chain?.tokenomics?.bondedTokens) / 10 ** Number(chain.params.coinDecimals)
    : 0;

  const communityPool = chain?.params?.coinDecimals != null
    ? Number(chain?.tokenomics?.communityPool) / 10 ** Number(chain.params.coinDecimals)
    : 0;

  const averageDelegation = chain?.params?.coinDecimals != null
    ? Number(chain?.tokenomics?.averageDelegation) / 10 ** Number(chain.params.coinDecimals)
    : 0;

  const unbondingTokens = chain?.params?.coinDecimals != null
    ? Number(chain?.tokenomics?.unbondingTokens) / 10 ** Number(chain.params.coinDecimals)
    : 0;

  const tvs = chain?.tokenomics?.tvs != null ? Number(chain.tokenomics.tvs) : 0;

  const hasTotalStaked = totalStaked > 0;
  const hasTvs = tvs > 0;
  const hasCommunityPool = communityPool > 0;
  const hasAverageDelegation = averageDelegation > 0;
  const hasUnbondingTokens = unbondingTokens > 0;

  return (
    <div className="grid grid-cols-2 gap-x-10">
      <div className="mt-2 flex w-full bg-table_row hover:bg-bgHover border-b border-bgSt">
        <div className="w-1/2 items-center border-r border-bgSt py-5 pl-10 font-sfpro text-lg">
          {t('community pool total')}
        </div>
        <div className={`flex w-1/2 cursor-pointer items-center py-5 pl-6 font-handjet text-lg hover:text-highlight ${!hasCommunityPool ? 'blur-sm pointer-events-none' : ''}`}>
          {hasCommunityPool ? (
            <Tooltip tooltip={communityPool.toLocaleString()}>
              {`${formatCash(communityPool)} ${chain?.params?.denom}`}
            </Tooltip>
          ) : (
            'N/A'
          )}
        </div>
      </div>
      <div className="mt-2 flex w-full bg-table_row hover:bg-bgHover border-b border-bgSt">
        <div className="w-1/2 items-center border-r border-bgSt py-5 pl-10 font-sfpro text-lg">
          {t('total staked')}
        </div>
        <div className={`flex w-1/2 cursor-pointer items-center py-5 pl-6 font-handjet text-lg hover:text-highlight ${!hasTotalStaked ? 'blur-sm pointer-events-none' : ''}`}>
          {hasTotalStaked ? (
            <Tooltip tooltip={totalStaked.toLocaleString()}>
              {`${formatCash(totalStaked)} ${chain?.params?.denom}`}
            </Tooltip>
          ) : (
            'N/A'
          )}
        </div>
      </div>
      <div className="mt-2 flex w-full bg-table_row hover:bg-bgHover border-b border-bgSt">
        <div className="w-1/2 items-center border-r border-bgSt py-5 pl-10 font-sfpro text-lg">
          {t('average delegations')}
        </div>
        <div className={`flex w-1/2 cursor-pointer items-center py-5 pl-6 font-handjet text-lg hover:text-highlight ${!hasAverageDelegation ? 'blur-sm pointer-events-none' : ''}`}>
          {hasAverageDelegation ? (
            <Tooltip tooltip={averageDelegation.toLocaleString()}>
              {`${formatCash(averageDelegation)} ${chain?.params?.denom}`}
            </Tooltip>
          ) : (
            'N/A'
          )}
        </div>
      </div>
      <div className="mt-2 flex w-full bg-table_row hover:bg-bgHover border-b border-bgSt">
        <div className="w-1/2 items-center border-r border-bgSt py-5 pl-10 font-sfpro text-lg">
          {t('% staked')}
        </div>
        <div className={`flex w-1/2 cursor-pointer items-center py-5 pl-6 font-handjet text-lg hover:text-highlight ${!hasTvs ? 'blur-sm pointer-events-none' : ''}`}>
          {hasTvs ? `${(tvs * 100).toFixed(2)}%` : 'N/A'}
        </div>
      </div>
      <div className="mt-2 flex w-full bg-table_row hover:bg-bgHover border-b border-bgSt">
        <div className="w-1/2 items-center border-r border-bgSt py-5 pl-10 font-sfpro text-lg">
          {t('pending delegations')}
        </div>
        <div className={`flex w-1/2 cursor-pointer items-center py-5 pl-6 font-handjet text-lg hover:text-highlight ${!hasUnbondingTokens ? 'blur-sm pointer-events-none' : ''}`}>
          {hasUnbondingTokens ? (
            <Tooltip tooltip={unbondingTokens.toLocaleString()}>
              {`${formatCash(unbondingTokens)} ${chain?.params?.denom}`}
            </Tooltip>
          ) : (
            'N/A'
          )}
        </div>
      </div>
      <div className="mt-2 flex w-full bg-table_row hover:bg-bgHover border-b border-bgSt">
        <div className="w-1/2 items-center border-r border-bgSt py-5 pl-10 font-sfpro text-lg">
          {t('healthy validators')}
        </div>
        <div className="flex w-1/2 items-center py-5 pl-6 font-handjet text-lg blur-sm pointer-events-none">
          N/A
        </div>
      </div>
    </div>
  );
};

export default NetworkStatistics;
