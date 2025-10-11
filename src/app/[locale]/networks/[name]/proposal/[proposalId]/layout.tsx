import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { ReactNode } from 'react';

import AiGeneratedSummary from '@/app/networks/[name]/proposal/[proposalId]/ai-generated-summary';
import ProposalInformation from '@/app/networks/[name]/proposal/[proposalId]/proposal-information';
import ProposalMetrics from '@/app/networks/[name]/proposal/[proposalId]/proposal-metrics';
import PageTitle from '@/components/common/page-title';
import SubDescription from '@/components/sub-description';
import { Locale } from '@/i18n';
import chainService from '@/services/chain-service';
import ProposalService from '@/services/proposal-service';

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

  const cursor =
    'h-7 min-h-7 w-7 min-w-7 bg-contain bg-no-repeat bg-cursor group-hover:bg-cursor_h group-active:bg-cursor_a';

  return (
    <>
      <PageTitle
        text={`${t('title')}: #${proposalId}`}
        suffix={
          <Link href={`/networks/${chain?.name}/overview/`} className="group flex text-highlight hover:underline ">
            {chain?.prettyName}
            <div className={cursor} />
          </Link>
        }
      />
      <SubDescription text={t('description')} contentClassName={'m-4'} plusClassName={'mt-2'} />
      <ProposalInformation proposal={proposal} chainName={name} />
      <ProposalMetrics proposal={proposal} chain={chain} />
      {children}
      <AiGeneratedSummary />
    </>
  );
}
