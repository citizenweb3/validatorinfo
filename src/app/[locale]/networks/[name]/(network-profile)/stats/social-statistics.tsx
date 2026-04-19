import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import MetricsCardItem from '@/components/common/metrics-cards/metrics-card-item';
import SubTitle from '@/components/common/sub-title';
import ToolTip from '@/components/common/tooltip';
import { ChainWithParamsAndTokenomics } from '@/services/chain-service';

interface OwnProps {
  chain: ChainWithParamsAndTokenomics | null;
}

const SocialStatistics: FC<OwnProps> = async ({ chain }) => {
  const t = await getTranslations('NetworkStatistics');

  const telegramMembers = chain?.telegramMembers ?? 0;
  const discordMembers = chain?.discordMembers ?? 0;
  const membersTotal = telegramMembers + discordMembers;
  const hasFollowers = !!chain?.twitterFollowers && chain.twitterFollowers > 0;
  const hasMembers = membersTotal > 0;

  const tooltipParts: string[] = [];
  if (telegramMembers > 0) tooltipParts.push(`Telegram: ${telegramMembers.toLocaleString()}`);
  if (discordMembers > 0) tooltipParts.push(`Discord: ${discordMembers.toLocaleString()}`);
  const membersTooltip = tooltipParts.length > 0 ? tooltipParts.join(' | ') : t('members tooltip no data');

  return (
    <div className="mb-10 mt-10">
      <SubTitle text={t('Social')} />
      <div className="mx-auto mt-16 flex w-fit items-center justify-between rounded border border-bgSt bg-gradient-to-t from-[#181818] from-[26%] to-[rgba(62,62,62,0.3)] px-4 py-1 shadow-[0px_6px_6px_0px_rgba(0,0,0,0.25),0px_4px_4px_0px_rgba(0,0,0,0.25),0px_4px_4px_0px_black]">
        <div className="font-sfpro text-lg">{t('price of active user')}:</div>
        <div className="ml-24 px-24 font-handjet text-xl text-highlight blur-sm pointer-events-none">$124,438</div>
      </div>
      <div className="mt-12 flex w-full flex-row justify-center gap-6">
        <ToolTip tooltip={t('followers tooltip')} direction={'top'}>
          <div className={!hasFollowers ? 'blur-sm pointer-events-none' : ''}>
            <MetricsCardItem
              title={t('followers')}
              data={hasFollowers ? chain.twitterFollowers : '50'}
              className={'pb-2 pt-2.5'}
              dataClassName={'my-5'}
            />
          </div>
        </ToolTip>
        <ToolTip tooltip={t('believers tooltip')} direction={'top'}>
          <div className="blur-sm pointer-events-none">
            <MetricsCardItem
              title={t('believers')}
              data={'50'}
              className={'pb-2 pt-2.5'}
              dataClassName={'my-5'}
            />
          </div>
        </ToolTip>
        <ToolTip tooltip={membersTooltip} direction={'top'}>
          <div className={!hasMembers ? 'blur-sm pointer-events-none' : ''}>
            <MetricsCardItem
              title={t('members')}
              data={hasMembers ? membersTotal.toLocaleString() : '50'}
              className={'pb-2 pt-2.5'}
              dataClassName={'my-5'}
            />
          </div>
        </ToolTip>
      </div>
    </div>
  );
};

export default SocialStatistics;
