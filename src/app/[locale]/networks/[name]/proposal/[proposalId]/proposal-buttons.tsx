'use client';

import { usePathname } from 'next/navigation';
import { FC } from 'react';
import { useTranslations } from 'next-intl';

import RoundedButton from '@/components/common/rounded-button';
import { useProposalText } from '@/app/networks/[name]/proposal/[proposalId]/proposal-text-context';

interface OwnProps {
  chainName: string;
  proposalId: string;
  showVotesText: string;
  hideVotesText: string;
  showAllProposalsText: string;
  votesPath: 'votes' | 'signals';
  hasText?: boolean;
}

const ProposalButtons: FC<OwnProps> = ({
  chainName,
  proposalId,
  showVotesText,
  hideVotesText,
  showAllProposalsText,
  votesPath,
  hasText,
}) => {
  const pathname = usePathname();
  const t = useTranslations('ProposalPage');
  const { isExpanded, toggle } = useProposalText();
  const isOnVotesPage = pathname.endsWith('/votes') || pathname.endsWith('/signals');

  const votesButtonHref = isOnVotesPage
    ? `/networks/${chainName}/proposal/${proposalId}`
    : `/networks/${chainName}/proposal/${proposalId}/${votesPath}`;

  const votesButtonText = isOnVotesPage ? hideVotesText : showVotesText;

  return (
    <div className="flex justify-end gap-4 mb-4">
      <RoundedButton href={`/networks/${chainName}/governance`} className="font-handjet text-lg">
        {showAllProposalsText}
      </RoundedButton>
      <RoundedButton href={votesButtonHref} className="font-handjet text-lg" scroll={false}>
        {votesButtonText}
      </RoundedButton>
      {hasText && (
        <RoundedButton onClick={toggle} className="font-handjet text-lg">
          {isExpanded ? t('hide proposal text') : t('show proposal text')}
        </RoundedButton>
      )}
    </div>
  );
};

export default ProposalButtons;
