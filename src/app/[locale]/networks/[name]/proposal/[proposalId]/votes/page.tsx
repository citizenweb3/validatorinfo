import { getTranslations } from 'next-intl/server';

import ValidatorsVotes from '@/app/networks/[name]/proposal/[proposalId]/votes/validators-votes-table/validators-votes';
import RoundedButton from '@/components/common/rounded-button';
import { NextPageWithLocale } from '@/i18n';
import { SortDirection } from '@/server/types';
import chainService from '@/services/chain-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: NextPageWithLocale & { name: string; proposalId: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

const defaultPerPage = 10;

const ProposalVotesPage: NextPageWithLocale<PageProps> = async ({
  params: { locale, name, proposalId },
  searchParams: q,
}) => {
  const t = await getTranslations({ locale, namespace: 'ProposalPage' });
  const currentPage = parseInt((q.p as string) || '1');
  const perPage = q.pp ? parseInt(q.pp as string) : defaultPerPage;
  const sortBy = (q.sortBy as 'moniker') ?? 'moniker';
  const order = (q.order as SortDirection) ?? 'asc';
  const vote = (q.vote as 'all') ?? 'all';
  const search = q.search as string;

  return (
    <>
      <div className="flex justify-end">
        <RoundedButton href={`/networks/${name}/proposal/${proposalId}`} className="font-handjet text-lg">
          {t('hide dropdown')}
        </RoundedButton>
      </div>
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
