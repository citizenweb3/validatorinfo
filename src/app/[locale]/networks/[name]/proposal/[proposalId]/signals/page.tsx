import { getTranslations } from 'next-intl/server';

import RoundedButton from '@/components/common/rounded-button';
import { NextPageWithLocale } from '@/i18n';
import { SortDirection } from '@/server/types';
import AztecSignalService from '@/services/aztec-signal-service';
import ProposalService from '@/services/proposal-service';
import { isAztecNetwork } from '@/utils/chain-utils';
import { parseAztecProposalContent } from '@/app/networks/[name]/proposal/[proposalId]/aztec/aztec-proposal-utils';
import SignalsTable from '@/app/networks/[name]/proposal/[proposalId]/signals/signals-table/signals-table';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: NextPageWithLocale & { name: string; proposalId: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

const defaultPerPage = 10;

const ProposalSignalsPage: NextPageWithLocale<PageProps> = async ({
    params: { locale, name, proposalId },
    searchParams: q,
  }) => {
  const t = await getTranslations({ locale, namespace: 'ProposalPage' });

  if (!isAztecNetwork(name)) {
    return (
      <div className="mt-8 text-center text-lg" role="alert">
        Signals are only available for Aztec networks
      </div>
    );
  }

  const proposal = await ProposalService.getProposalByChainNameAndId(name, proposalId);
  if (!proposal) {
    return (
      <div className="mt-8 text-center text-lg" role="alert">
        Proposal not found
      </div>
    );
  }

  const parsedContent = parseAztecProposalContent(proposal.content);
  const gsePayload = parsedContent?.payload ?? null;

  if (!gsePayload) {
    return (
      <div className="mt-8 text-center text-lg" role="alert">
        No payload address found for this proposal
      </div>
    );
  }

  const originalPayload = await AztecSignalService.getOriginalPayload(name, gsePayload);
  const payload = originalPayload ?? gsePayload;

  const currentPage = parseInt((q.p as string) || '1');
  const perPage = q.pp ? parseInt(q.pp as string) : defaultPerPage;
  const sortBy = (q.sortBy as string) ?? 'timestamp';
  const order = (q.order as SortDirection) ?? 'desc';

  return (
    <>
      <div className="flex justify-end">
        <RoundedButton href={`/networks/${name}/proposal/${proposalId}`} className="font-handjet text-lg">
          {t('hide validator signals')}
        </RoundedButton>
      </div>
      <SignalsTable
        chainName={name}
        payload={payload}
        sort={{ sortBy, order }}
        perPage={perPage}
        currentPage={currentPage}
      />
    </>
  );
};

export default ProposalSignalsPage;
