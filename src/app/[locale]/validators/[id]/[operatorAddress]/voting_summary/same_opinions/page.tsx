import { getTranslations } from 'next-intl/server';

import SameOpinions from '@/components/same-opinions/same-opinions';
import SubDescription from '@/components/sub-description';
import { NextPageWithLocale } from '@/i18n';
import { SortDirection } from '@/server/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: NextPageWithLocale & { id: string; operatorAddress: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

const defaultPerPage = 25;

const SameOpinionsPage: NextPageWithLocale<PageProps> = async ({
  params: { locale, operatorAddress },
  searchParams: q,
}) => {
  const t = await getTranslations({ locale, namespace: 'SameOpinionsPage' });

  const currentPage = parseInt((q.p as string) || '1');
  const perPage = q.pp ? parseInt(q.pp as string) : defaultPerPage;
  const sortBy = q.sortBy === 'match' || q.sortBy === 'common' ? q.sortBy : 'score';
  const order = (q.order as SortDirection) ?? 'desc';

  return (
    <div className="mb-14">
      <SubDescription text={t('description')} contentClassName={'m-4'} plusClassName={'mt-2'} />
      <SameOpinions
        page={'SameOpinionsPage'}
        operatorAddress={operatorAddress}
        perPage={perPage}
        currentPage={currentPage}
        sort={{ sortBy, order }}
      />
    </div>
  );
};

export default SameOpinionsPage;
