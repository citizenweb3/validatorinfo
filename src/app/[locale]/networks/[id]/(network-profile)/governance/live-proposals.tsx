import { getTranslations } from 'next-intl/server';
import { FC } from 'react';
import Image from 'next/image';
import cutHash from '@/utils/cut-hash';
import SubTitle from '@/components/common/sub-title';
import Link from 'next/link';
import { Proposal } from '@prisma/client';

interface OwnProps {
  proposals: Proposal[];
}

const LiveProposals: FC<OwnProps> = async ({ proposals }) => {
  const t = await getTranslations('NetworkGovernance');
  const liveProposals = proposals?.filter(proposal => proposal.status === 'PROPOSAL_STATUS_VOTING_PERIOD');

  return (
    <div className="mt-16">
      <SubTitle text={t('Live Proposals')} />
      <div className="grid grid-cols-2 gap-x-10 mt-8">
        {liveProposals.map((proposal) => (
          <div key={proposal.proposalId} className="mt-2 flex border-bgSt border-b pb-9">
            <div className="w-3/5 text-base ml-4">
              <div className="mb-5 hover:underline hover:underline-offset-2">
                <Link href={`/networks/${proposal.chainId}/proposal/${proposal.proposalId}`}>
                  <span className="font-handjet text-highlight text-lg">
                    #{proposal.proposalId}&nbsp;
                  </span>
                  - {proposal.title}
                </Link>
              </div>
              <div>
                {t('proposer')}:&nbsp;
                <Link href="" className="underline underline-offset-3 font-handjet text-lg">
                  {cutHash({
                    value: 'cosmosvaloper1e859xaue4k2jzqw20cv6l7p3tmc378pc3k8g2u',
                    cutLength: 10,
                  })}
                </Link>
              </div>
              <div className="mt-1">
                {t('voting start')}:&nbsp;
                <span className="font-handjet text-lg">
                  {proposal.votingStartTime.toDateString()} - {proposal.votingStartTime.toTimeString().split(" ").slice(0, 2).join(" ")}
                </span>
              </div>
              <div className="mt-1">
                {t('voting end')}:&nbsp;
                <span className="font-handjet text-lg">
                  {proposal.votingEndTime.toDateString()} - {proposal.votingEndTime.toTimeString().split(" ").slice(0, 2).join(" ")}
                </span>
              </div>
              <div className="mt-1">
                {t('remaining time')}:&nbsp;
                <span className="font-handjet text-lg">
                  {(proposal.votingEndTime.getTime() - Date.now())}
                </span>
              </div>
            </div>
            <div className="w-2/5">
              <Image
                src={'/img/charts/voting-period-circle.svg'}
                width={300}
                height={300}
                alt="voting period"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveProposals;
