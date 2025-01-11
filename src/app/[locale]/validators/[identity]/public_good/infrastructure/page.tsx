import { getTranslations } from 'next-intl/server';

import ValidatorCreatedProposalsBar from '@/app/validators/[identity]/governance/created-proposals-bar';
import ValidatorVotes from '@/app/validators/[identity]/governance/validator-votes/validator-votes';
import PageTitle from '@/components/common/page-title';
import RoundedButton from '@/components/common/rounded-button';
import SubTitle from '@/components/common/sub-title';
import { NextPageWithLocale } from '@/i18n';
import ValidatorService, { SortDirection } from '@/services/validator-service';

interface PageProps {
  params: NextPageWithLocale & { identity: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

const defaultPerPage = 1;

const PublicGoodInfrastructurePage: NextPageWithLocale<PageProps> = async ({ params: { locale, identity }, searchParams: q }) => {
  const t = await getTranslations({ locale, namespace: 'PublicGoodInfrastructurePage' });

  const currentPage = parseInt((q.p as string) || '1');
  const perPage = q.pp ? parseInt(q.pp as string) : defaultPerPage;
  const sortBy = (q.sortBy as 'name') ?? 'name';
  const order = (q.order as SortDirection) ?? 'asc';

  return (
    <div>
      <div className="font-sfpro text-base mt-12 mb-7 ml-4">{t('description')}</div>
      <div className="flex justify-end mt-4 mb-3">
        <RoundedButton href={''} className="font-handjet text-base">
          {t('submit new info')}
        </RoundedButton>
      </div>
      <div className="mb-20 mt-6">
        <SubTitle text={t('proposals')} size="h2" />
        <div className="mt-6 flex justify-center">
          <ValidatorCreatedProposalsBar />
        </div>
      </div>
      <div>
        <SubTitle text={t('news feed')} size="h2" />
        <div className="flex justify-end mt-4 mb-3">
          <RoundedButton href={''} className="font-handjet text-base">
            {t('similar options')}
          </RoundedButton>
        </div>
        <ValidatorVotes
          page={'ValidatorGovernancePage'}
          perPage={perPage}
          currentPage={currentPage}
          sort={{ sortBy, order }}
        />
      </div>
    </div>
  );
};

export default PublicGoodInfrastructurePage;
