import { getTranslations } from 'next-intl/server';

import NodePagesTitle from '@/app/validators/[identity]/[operatorAddress]/node-pages-title';
import NodeVotes from '@/app/validators/[identity]/[operatorAddress]/voting_summary/node-votes/node-votes';
import RoundedButton from '@/components/common/rounded-button';
import { Locale, NextPageWithLocale } from '@/i18n';
import ValidatorService, { SortDirection } from '@/services/validator-service';

interface PageProps {
  params: NextPageWithLocale & { identity: string; operatorAddress: string };
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
  params: { locale, identity, operatorAddress },
  searchParams: q,
}) => {
  const t = await getTranslations({ locale, namespace: 'VotingSummaryPage' });

  const currentPage = parseInt((q.p as string) || '1');
  const perPage = q.pp ? parseInt(q.pp as string) : defaultPerPage;
  const sortBy = (q.sortBy as 'name') ?? 'name';
  const order = (q.order as SortDirection) ?? 'asc';

  const { validatorNodesWithChainData: list } = await ValidatorService.getValidatorNodesWithChains(identity);
  const node = list.find((item) => item.operator_address === operatorAddress);

  return (
    <div className="mb-14">
      <NodePagesTitle page={'VotingSummaryPage'} locale={locale} node={node} />
      <div>
        <div className="my-4 flex justify-end">
          <RoundedButton href={''} className="font-handjet text-base">
            {t('show same opinion')}
          </RoundedButton>
        </div>
        <NodeVotes page={'VotingSummaryPage'} perPage={perPage} currentPage={currentPage} sort={{ sortBy, order }} />
      </div>
    </div>
  );
};

export default VotingSummaryPage;
