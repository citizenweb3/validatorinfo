import { getTranslations } from 'next-intl/server';

import SameOpinions from '@/components/same-opinions/same-opinions';
import SameOpinionsNetworkFilter from '@/components/same-opinions/same-opinions-network-filter';
import SubDescription from '@/components/sub-description';
import { NextPageWithLocale } from '@/i18n';
import { SortDirection } from '@/server/types';
import voteService from '@/services/vote-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: NextPageWithLocale & { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

const defaultPerPage = 25;

const ValidatorSameOpinionsPage: NextPageWithLocale<PageProps> = async ({
  params: { locale, id },
  searchParams: q,
}) => {
  const t = await getTranslations({ locale, namespace: 'SameOpinionsPage' });

  const validatorId = parseInt(id);
  const currentPage = parseInt((q.p as string) || '1');
  const perPage = q.pp ? parseInt(q.pp as string) : defaultPerPage;
  const sortBy = q.sortBy === 'match' || q.sortBy === 'common' ? q.sortBy : 'score';
  const order = (q.order as SortDirection) ?? 'desc';

  const voteChains = await voteService.getValidatorVoteChains(validatorId);
  const selected = voteChains.find((chain) => chain.chainName === q.network) ?? voteChains[0];

  if (!selected) {
    return (
      <div className="mb-14">
        <SubDescription text={t('description')} contentClassName={'m-4'} plusClassName={'mt-2'} />
        <div className="py-8 text-center font-sfpro text-base text-highlight">{t('no voting data')}</div>
      </div>
    );
  }

  return (
    <div className="mb-14">
      <SubDescription text={t('description')} contentClassName={'m-4'} plusClassName={'mt-2'} />
      <div className="mb-4 flex justify-end">
        <SameOpinionsNetworkFilter
          options={voteChains.map((chain) => ({ value: chain.chainName, title: chain.prettyName }))}
          selected={selected.chainName}
        />
      </div>
      <SameOpinions
        page={'SameOpinionsPage'}
        operatorAddress={selected.operatorAddress}
        perPage={perPage}
        currentPage={currentPage}
        sort={{ sortBy, order }}
      />
    </div>
  );
};

export default ValidatorSameOpinionsPage;
