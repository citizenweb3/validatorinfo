'use client';

import { useTranslations } from 'next-intl';
import { FC, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Proposal } from '@prisma/client';
import cutHash from '@/utils/cut-hash';
import SubTitle from '@/components/common/sub-title';
import { formatDuration, intervalToDuration } from 'date-fns';
import RoundedButton from '@/components/common/rounded-button';

interface OwnProps {
  proposals: Proposal[];
}

const LiveProposals: FC<OwnProps> = ({ proposals }) => {
  const t = useTranslations('NetworkGovernance');
  const [showAll, setShowAll] = useState(false);

  const getProposalDuration = (votingEndTime: Date) => {
    const duration = intervalToDuration({
      start: Date.now(),
      end: new Date(votingEndTime),
    });
    return formatDuration(duration, {
      format: ['days', 'hours', 'minutes'],
    });
  };

  const liveProposals = proposals.filter(
    proposal => proposal.status === 'PROPOSAL_STATUS_VOTING_PERIOD',
  );

  const proposalsToShow = showAll ? liveProposals : liveProposals.slice(0, 2);

  return (
    <div className="mt-16">
      <SubTitle text={t('Live Proposals')} />
      {liveProposals.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-x-10 mt-8">
            {proposalsToShow.map((proposal) => (
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
                      {new Date(proposal.votingStartTime).toDateString()} -{' '}
                      {new Date(proposal.votingStartTime)
                        .toTimeString()
                        .split(' ')
                        .slice(0, 2)
                        .join(' ')}
                    </span>
                  </div>
                  <div className="mt-1">
                    {t('voting end')}:&nbsp;
                    <span className="font-handjet text-lg">
                      {new Date(proposal.votingEndTime).toDateString()} -{' '}
                      {new Date(proposal.votingEndTime)
                        .toTimeString()
                        .split(' ')
                        .slice(0, 2)
                        .join(' ')}
                    </span>
                  </div>
                  <div className="mt-1">
                    {t('remaining time')}:&nbsp;
                    <span className="font-handjet text-lg">
                      {getProposalDuration(proposal.votingEndTime)}
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
          {liveProposals.length > 2 && (
            <div className="flex flex-row mt-4 justify-end">
              <RoundedButton className="text-lg font-handjet" onClick={() => setShowAll(!showAll)}>
                {showAll ? t('less live proposals') : t('more live proposals')}
              </RoundedButton>
            </div>
          )}
        </>
      ) : (
        <div className="my-8 font-handjet text-lg text-center">
          {t('no live proposals')}
        </div>
      )}
    </div>
  );
};

export default LiveProposals;
