'use client';

import { usePathname } from 'next/navigation';
import { FC } from 'react';

import RoundedButton from '@/components/common/rounded-button';

interface OwnProps {
  chainName: string;
  proposalId: string;
  showVotesText: string;
  hideVotesText: string;
  showAllProposalsText: string;
  votesPath: 'votes' | 'signals';
}

const ProposalButtons: FC<OwnProps> = ({
  chainName,
  proposalId,
  showVotesText,
  hideVotesText,
  showAllProposalsText,
  votesPath,
}) => {
  const pathname = usePathname();
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
    </div>
  );
};

export default ProposalButtons;
