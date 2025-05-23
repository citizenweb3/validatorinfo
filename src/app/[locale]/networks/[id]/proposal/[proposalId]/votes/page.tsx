import { NextPageWithLocale } from '@/i18n';
import RoundedButton from '@/components/common/rounded-button';
import { SortDirection } from '@/server/types';
import ValidatorsVotes from '@/app/networks/[id]/proposal/[proposalId]/votes/validators-votes-table/validators-votes';
import { getTranslations } from 'next-intl/server';

interface PageProps {
  params: NextPageWithLocale & { id: string; proposalId: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

const defaultPerPage = 1;

const ProposalVotesPage: NextPageWithLocale<PageProps> = async ({
    params: { locale, id, proposalId }, searchParams: q,
  }) => {
  const t = await getTranslations({ locale, namespace: 'ProposalPage' });
  const currentPage = parseInt((q.p as string) || '1');
  const perPage = q.pp ? parseInt(q.pp as string) : defaultPerPage;
  const sortBy = (q.sortBy as 'name') ?? 'name';
  const order = (q.order as SortDirection) ?? 'asc';

  return (
    <>
      <div className="flex justify-end">
        <RoundedButton href={`/networks/${id}/proposal/${proposalId}`} className="font-handjet text-lg">
          {t('hide dropdown')}
        </RoundedButton>
      </div>
      <ValidatorsVotes page={'ProposalPage'} perPage={perPage} currentPage={currentPage} sort={{ sortBy, order }} />
    </>
  );
};

export default ProposalVotesPage;
