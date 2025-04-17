import { Proposal } from '@prisma/client';
import { getTranslations } from 'next-intl/server';
import { FC } from 'react';
import Tooltip from '@/components/common/tooltip';
import RoundedButton from '@/components/common/rounded-button';
import Link from 'next/link';

interface OwnProps {
  proposal: Proposal | null;
}

const ProposalInformation: FC<OwnProps> = async ({ proposal }) => {
  const t = await getTranslations('ProposalPage');

  return (
    <div className="mt-2">
      <div className="flex justify-between mb-8 ml-5">
        <div className="flex flex-row">
          <div className="flex mr-5">
            <Tooltip tooltip={t('proposal tooltip')} direction={'bottom'}>
              <div className="h-24 min-h-24 w-24 min-w-24 bg-contain bg-no-repeat bg-proposal hover:bg-proposal_h" />
            </Tooltip>
          </div>
          <div className="flex flex-col justify-center">
            {proposal?.status === 'PROPOSAL_STATUS_VOTING_PERIOD' ? (
              <div className="flex flex-row font-handjet text-lg text-center mb-1">
                <div className="rounded-full bg-primary shadow-button px-6 mr-6">{t('signaling')}</div>
                <div className="rounded-full bg-proposalLabel shadow-button px-6">{t('on going')}</div>
              </div>
            ) : (
              <div className="flex flex-row font-handjet text-lg text-center mb-1">
                <div className="rounded-full bg-secondary shadow-button px-6">{t('past')}</div>
              </div>
            )}
            <Link href={''}>
              <div className="text-lg font-handjet text-highlight">
                {t('link to full proposal')}
              </div>
            </Link>
            <div className="flex flex-row mt-4 items-end">
              <div className="font-sfpro text-base pb-0.5">{`${t('voting period')}`}:&nbsp;</div>
              <div className="font-handjet text-lg">
                {new Date(proposal?.votingStartTime ?? 'Date').toDateString().split(' ').slice(1, 4).join(' ')},
                {' '}
                {new Date(proposal?.votingStartTime ?? 'Time').toTimeString().split(' ').slice(0, 2).join(' ')}
                {' ~ '}
                {new Date(proposal?.votingEndTime ?? 'Date').toDateString().split(' ').slice(1, 4).join(' ')},
                {' '}
                {new Date(proposal?.votingEndTime ?? 'Time').toTimeString().split(' ').slice(0, 2).join(' ')}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <RoundedButton href={`/networks/${proposal?.chainId}/governance`}
                         className="font-handjet text-lg mb-4 active:mb-3">
            {t('show all proposals')}
          </RoundedButton>
        </div>
      </div>
    </div>
  );
};

export default ProposalInformation;
