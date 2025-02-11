import { getTranslations } from 'next-intl/server';

import NodePagesTitle from '@/app/validators/[id]/[operatorAddress]/node-pages-title';
import NodeVotes from '@/app/validators/[id]/[operatorAddress]/voting_summary/node-votes-table/node-votes';
import RoundedButton from '@/components/common/rounded-button';
import { Locale, NextPageWithLocale } from '@/i18n';
import { SortDirection } from '@/server/types';
import validatorService from '@/services/validator-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: NextPageWithLocale & { id: string; operatorAddress: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }) {
  const t = await getTranslations({ locale, namespace: 'VotingSummaryPage' });

  return {
    title: t('title'),
  };
}

const defaultPerPage = 1;

const VotingSummaryPage: NextPageWithLocale<PageProps> = async ({
  params: { locale, id, operatorAddress },
  searchParams: q,
}) => {
  const t = await getTranslations({ locale, namespace: 'VotingSummaryPage' });

  const validatorId = parseInt(id);
  const currentPage = parseInt((q.p as string) || '1');
  const perPage = q.pp ? parseInt(q.pp as string) : defaultPerPage;
  const sortBy = (q.sortBy as 'name') ?? 'name';
  const order = (q.order as SortDirection) ?? 'asc';

  const { validatorNodesWithChainData: list } = await validatorService.getValidatorNodesWithChains(validatorId);
  const node = list.find((item) => item.operatorAddress === operatorAddress);

  return (
    <div className="mb-14">
      <NodePagesTitle page={'VotingSummaryPage'} locale={locale} node={node} />
      <div>
        <div className="my-4 flex justify-end">
          <RoundedButton href={''} className="font-handjet text-lg">
            {t('show same opinion')}
          </RoundedButton>
        </div>
        <NodeVotes page={'VotingSummaryPage'} perPage={perPage} currentPage={currentPage} sort={{ sortBy, order }} />
      </div>
    </div>
  );
};

export default VotingSummaryPage;
