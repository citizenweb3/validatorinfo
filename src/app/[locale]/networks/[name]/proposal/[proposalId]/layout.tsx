import { ProposalStatus } from '@prisma/client';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { ReactNode } from 'react';

import AiGeneratedSummary from '@/app/networks/[name]/proposal/[proposalId]/ai-generated-summary';
import AztecProposalDetails from '@/app/networks/[name]/proposal/[proposalId]/aztec/aztec-proposal-details';
import ProposalButtons from '@/app/networks/[name]/proposal/[proposalId]/proposal-buttons';
import ProposalFullText from '@/app/networks/[name]/proposal/[proposalId]/proposal-full-text';
import { ProposalTextProvider } from '@/app/networks/[name]/proposal/[proposalId]/proposal-text-context';
import ProposalInformation from '@/app/networks/[name]/proposal/[proposalId]/proposal-information';
import ProposalMetrics from '@/app/networks/[name]/proposal/[proposalId]/proposal-metrics';
import PageTitle from '@/components/common/page-title';
import SubDescription from '@/components/sub-description';
import { Locale } from '@/i18n';
import chainService from '@/services/chain-service';
import ProposalService from '@/services/proposal-service';
import { isAztecNetwork } from '@/utils/chain-utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProposalLayout({
    children,
    params: { locale, name, proposalId },
  }: Readonly<{
    children: ReactNode;
    params: { locale: Locale; name: string; proposalId: string };
  }>) {
  const t = await getTranslations({ locale, namespace: 'ProposalPage' });
  const chain = await chainService.getByName(name);
  const proposal = chain ? await ProposalService.getProposalById(chain?.id, proposalId) : null;

  const isAztecSignalingPhase = chain?.name &&
    isAztecNetwork(chain.name) &&
    proposal?.status === ProposalStatus.PROPOSAL_STATUS_DEPOSIT_PERIOD;

  const votesPath = isAztecSignalingPhase ? 'signals' : 'votes';
  const showVotesText = isAztecSignalingPhase ? t('show validator signals') : t('show validator votes');
  const hideVotesText = isAztecSignalingPhase ? t('hide validator signals') : t('hide validator votes');

  const hasText = !!proposal?.description?.trim() || !!proposal?.fullText?.trim();

  const cursor =
    'h-7 min-h-7 w-7 min-w-7 bg-contain bg-no-repeat bg-cursor group-hover:bg-cursor_h group-active:bg-cursor_a';

  return (
    <>
      <PageTitle
        text={`${t('title')}: #${proposalId} ${proposal?.title}`}
        prefix={
          <Link href={`/networks/${name}/overview/`} className="group flex text-highlight hover:underline ">
            {chain?.prettyName}
            <div className={cursor} />
          </Link>
        }
      />
      <SubDescription text={t('description')} contentClassName={'m-4'} plusClassName={'mt-2'} />
      <div className="flex justify-between items-start">
        <ProposalInformation proposal={proposal} />
        <div id="ai-summary-button-slot" className="flex items-center mt-2 mr-5" />
      </div>

      {isAztecNetwork(name) && proposal && (
        <AztecProposalDetails proposal={proposal} chainName={name} />
      )}

      <ProposalMetrics proposal={proposal} chain={chain} />
      <ProposalTextProvider>
        <div className="mt-10">
          <ProposalButtons
            chainName={name}
            proposalId={proposalId}
            showVotesText={showVotesText}
            hideVotesText={hideVotesText}
            showAllProposalsText={t('show all proposals')}
            votesPath={votesPath}
            hasText={hasText}
          />
        </div>

        {children}
        <ProposalFullText
          description={proposal?.description ?? null}
          fullText={proposal?.fullText ?? null}
        />
      </ProposalTextProvider>
      <AiGeneratedSummary hasText={hasText} chainId={chain?.id ?? null} proposalId={proposalId} />
    </>
  );
}
