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
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProposalLayout({ children, params: { locale, id, proposalId } }: Readonly<{
  children: ReactNode;
  params: { locale: Locale; id: string, proposalId: string };
}>) {
  const t = await getTranslations({ locale, namespace: 'ProposalPage' });
  const chainId = parseInt(id);
  const chain = await chainService.getById(chainId);
  const proposal = await ProposalService.getProposalById(chainId, proposalId);
  const cursor = 'h-7 min-h-7 w-7 min-w-7 bg-contain bg-no-repeat bg-cursor group-hover:bg-cursor_h group-active:bg-cursor_a';



  return (
    <>
      <PageTitle
        text={`${t('title')}: #${chainId}`}
        prefix={
          <Link href={`/networks/${chainId}/overview/`} className="text-highlight hover:underline group flex ">
            {chain?.prettyName}
            <div className={cursor} />
          </Link>
        }
      />
      <SubDescription text={t('description')} contentClassName={'m-4'} plusClassName={'mt-2'} />
      <ProposalInformation proposal={proposal} />
      <ProposalMetrics proposal={proposal} chain={chain} />
      {children}
      <AiGeneratedSummary />
    </>
  );
};
