import { ReactNode } from 'react';
import { Locale } from '@/i18n';
import chainService from '@/services/chain-service';
import PageTitle from '@/components/common/page-title';
import ProposalInformation from '@/app/networks/[id]/proposal/[proposalId]/proposal-information';
import ProposalMetrics from '@/app/networks/[id]/proposal/[proposalId]/proposal-metrics';
import AiGeneratedSummary from '@/app/networks/[id]/proposal/[proposalId]/ai-generated-summary';

export default async function ProposalLayout({ children, params: { locale, id, proposalId } }: Readonly<{
  children: ReactNode;
  params: { locale: Locale; id: string, proposalId: string };
}>) {
  const chainId = parseInt(id);
  const chain = await chainService.getById(chainId);

  return (
    <>
      <PageTitle text={'Gaia v15 Software Upgrade'} prefix={`#${proposalId}`} />
      <ProposalInformation chain={chain} />
      <ProposalMetrics chain={chain} />
      {children}
      <AiGeneratedSummary />
    </>
  );
};
