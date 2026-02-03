import ValidatorsVotes from '@/app/networks/[name]/proposal/[proposalId]/votes/validators-votes-table/validators-votes';
import { NextPageWithLocale } from '@/i18n';
import { SortDirection } from '@/server/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: NextPageWithLocale & { name: string; proposalId: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

const defaultPerPage = 10;

const ProposalVotesPage: NextPageWithLocale<PageProps> = async ({
  params: { name, proposalId },
  searchParams: q,
}) => {
  const currentPage = parseInt((q.p as string) || '1');
  const perPage = q.pp ? parseInt(q.pp as string) : defaultPerPage;
  const sortBy = (q.sortBy as 'moniker') ?? 'moniker';
  const order = (q.order as SortDirection) ?? 'asc';
  const vote = (q.vote as 'all') ?? 'all';
  const search = q.search as string;

  return (
    <>
      <ValidatorsVotes
        page={'ProposalPage'}
        perPage={perPage}
        currentPage={currentPage}
        sort={{ sortBy, order }}
        chainName={name}
        proposalId={proposalId}
        vote={vote}
        search={search}
      />
    </>
  );
};

export default ProposalVotesPage;
