import { ProposalStatus } from '@prisma/client';
import { getTranslations } from 'next-intl/server';

import RoundedButton from '@/components/common/rounded-button';
import { NextPageWithLocale } from '@/i18n';
import chainService from '@/services/chain-service';
import ProposalService from '@/services/proposal-service';
import { isAztecNetwork } from '@/utils/chain-utils';

interface PageProps {
  params: NextPageWithLocale & { name: string; proposalId: string };
}

const ProposalPage: NextPageWithLocale<PageProps> = async ({
    params: { locale, name, proposalId },
  }) => {
  const t = await getTranslations({ locale, namespace: 'ProposalPage' });

  const chain = await chainService.getByName(name);
  const proposal = chain ? await ProposalService.getProposalById(chain.id, proposalId) : null;

  const isAztecSignalingPhase = chain?.name &&
    isAztecNetwork(chain.name) &&
    proposal?.status === ProposalStatus.PROPOSAL_STATUS_DEPOSIT_PERIOD;

  const votesPath = isAztecSignalingPhase ? 'signals' : 'votes';
  const buttonText = isAztecSignalingPhase ? t('show validator signals') : t('show validator votes');

  return (
    <>
      <div className="flex justify-end">
        <RoundedButton href={`${proposalId}/${votesPath}`} className="font-handjet text-lg">
          {buttonText}
        </RoundedButton>
      </div>
    </>
  );
};

export default ProposalPage;
