import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import { networkProfileExample } from '@/app/networks/[id]/(network-profile)/networkProfileExample';
import Image from 'next/image';
import cutHash from '@/utils/cut-hash';
import SubTitle from '@/components/common/sub-title';
import Link from 'next/link';
import VotingPowerCirclesSSR from './network-proposals-list/live-prposal-graph';

interface OwnProps {
  chainId: string;
}

const LiveProposals: FC<OwnProps> = async ({ chainId }) => {
  const t = await getTranslations('NetworkGovernance');

  return (
    <div className="mt-16">
      <SubTitle text={t('Live Proposals')} />
      <div className="grid grid-cols-2 gap-x-10 mt-8">
        {networkProfileExample.liveProposals.map((item) => (
          <div key={item.proposalNumber} className="mt-2 flex border-bgSt border-b pb-9">
            <div className="w-3/5 text-base ml-4">
              <div className="mb-5 hover:underline hover:underline-offset-2">
                <Link href={`/networks/${chainId}/proposal/${item.proposalNumber}`}>
                  <span className="font-handjet text-highlight text-lg">
                    #{item.proposalNumber}&nbsp;
                  </span>
                  - {item.proposalTitle}
                </Link>
              </div>
              <div>
                {t(`${item.proposer.title as 'proposer'}`)}:&nbsp;
                <Link href="" className="underline underline-offset-3 font-handjet text-lg">
                  {cutHash({
                    value: item.proposer.data,
                    cutLength: 10,
                  })}
                </Link>
              </div>
              <div className="mt-1">
                {t(`${item.votingStart.title as 'voting start'}`)}:&nbsp;
                <span className="font-handjet text-lg">
                  {item.votingStart.data}
                </span>
              </div>
              <div className="mt-1">
                {t(`${item.votingEnd.title as 'voting end'}`)}:&nbsp;
                <span className="font-handjet text-lg">
                  {item.votingEnd.data}
                </span>
              </div>
              <div className="mt-1">
                {t(`${item.remainingTime.title as 'remaining time'}`)}:&nbsp;
                <span className="font-handjet text-lg">
                  {item.remainingTime.data}
                </span>
              </div>
            </div>
            <div className="w-2/5 ">
              <VotingPowerCirclesSSR yes={60} no={40} veto={65} abstain={45} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveProposals;
