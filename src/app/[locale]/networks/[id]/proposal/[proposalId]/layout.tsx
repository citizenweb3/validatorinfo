import { ReactNode } from 'react';
import { Locale } from '@/i18n';
import chainService from '@/services/chain-service';
import PageTitle from '@/components/common/page-title';
import ProposalInformation from '@/app/networks/[id]/proposal/[proposalId]/proposal-information';
import ProposalMetrics from '@/app/networks/[id]/proposal/[proposalId]/proposal-metrics';
import AiGeneratedSummary from '@/app/networks/[id]/proposal/[proposalId]/ai-generated-summary';
import { getTranslations } from 'next-intl/server';
import SubDescription from '@/components/sub-description';
import ProposalService from '@/services/proposal-service';

export default async function ProposalLayout({ children, params: { locale, id, proposalId } }: Readonly<{
  children: ReactNode;
  params: { locale: Locale; id: string, proposalId: string };
}>) {
  const t = await getTranslations({ locale, namespace: 'ProposalPage' });
  const chainId = parseInt(id);
  const chain = await chainService.getById(chainId);
  const proposal = await ProposalService.getProposalById(chainId, proposalId);

  return (
    <>
      <PageTitle text={`#${proposalId} ${proposal?.title}`} prefix={`${t('title')}:`} />
      <SubDescription text={t('description')} contentClassName={'m-4'} plusClassName={'mt-2'} />
      <ProposalInformation proposal={proposal} />
      <ProposalMetrics proposal={proposal} chain={chain} />
      {children}
      <AiGeneratedSummary />
    </>
  );
};
