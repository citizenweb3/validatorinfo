'use client';

import { useTranslations } from 'next-intl';
import { FC, useState } from 'react';
import Link from 'next/link';
import { Proposal } from '@prisma/client';
import cutHash from '@/utils/cut-hash';
import SubTitle from '@/components/common/sub-title';
import { formatDuration, intervalToDuration } from 'date-fns';
import RoundedButton from '@/components/common/rounded-button';
import VotingPowerSVG from './prposalChart/prposalSVG';

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

  const getVotingPercentages = (proposal: Proposal) => {
    try {
      if (proposal.tallyResult === null) {
        throw new Error('Tally result is null');
      }
      const tally = JSON.parse(proposal.tallyResult.toString());
      const yes = Number(tally.yes);
      const no = Number(tally.no);
      const abstain = Number(tally.abstain);
      const veto = Number(tally.no_with_veto);
      const total = yes + no + abstain + veto;
  
      const format = (num: number) => Number((num * 100 / total).toFixed(2));
      console.log('yes', format(yes), 'no', format(no),'abstain', format(abstain),'veto', format(veto));
      return {
        yes: total ? format(yes) : 0,
        no: total ? format(no) : 0,
        abstain: total ? format(abstain) : 0,
        veto: total ? format(veto) : 0,
      };
    } catch (error) {
      console.error('Failed to parse tally result:', error);
      return { yes: 0, no: 0, abstain: 0, veto: 0 };
    }
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
            {proposalsToShow.map((proposal) => {
              const { yes, no, abstain, veto } = getVotingPercentages(proposal);

              return (
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
                    <VotingPowerSVG
                      yes={yes}
                      no={no}
                      veto={veto}
                      abstain={abstain}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          {liveProposals.length > 2 && (
            <div className="flex flex-row mt-4 justify-end">
              <RoundedButton
                className="text-lg font-handjet"
                onClick={() => setShowAll(!showAll)}
              >
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
