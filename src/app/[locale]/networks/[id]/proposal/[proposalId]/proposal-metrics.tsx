import { getTranslations } from 'next-intl/server';
import { FC } from 'react';
import MetricsCardItem from '@/components/common/metrics-cards/metrics-card-item';
import { Chain } from '@prisma/client';
import { votesExample } from '@/app/networks/[id]/proposal/[proposalId]/votesExample';
import SubTitle from '@/components/common/sub-title';

interface OwnProps {
  chain: Chain | null;
}

const ProposalMetrics: FC<OwnProps> = async ({ chain }) => {
  const t = await getTranslations('ProposalPage');

  return (
    <div className="mt-4 mb-6">
      <SubTitle text={t('votes')} />
      <div className="mt-8 flex w-full flex-row justify-center gap-7">
        {votesExample.votes.map((item) => (
          <MetricsCardItem key={item.title}
                           title={t(item.title as 'yes')}
                           data={item.percents}
                           isPercents
                           addLineData={`${item.data.toLocaleString()} ${chain?.denom}`}
                           className={'pb-4 pt-2.5'}
                           dataClassName={'mt-2'}
                           addLineClassName={'font-handjet font-thin text-lg -mt-1'}
          />
        ))}
      </div>
    </div>

  );
};

export default ProposalMetrics;
