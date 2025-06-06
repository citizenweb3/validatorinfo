import { getTranslations } from 'next-intl/server';

import ValidatorCreatedProposalsBar from '@/app/validators/[id]/(validator-profile)/governance/created-proposals-bar';
import ValidatorVotes from '@/app/validators/[id]/(validator-profile)/governance/validator-votes/validator-votes';
import PageTitle from '@/components/common/page-title';
import RoundedButton from '@/components/common/rounded-button';
import SubTitle from '@/components/common/sub-title';
import ToolTip from '@/components/common/tooltip';
import { Locale, NextPageWithLocale } from '@/i18n';
import { SortDirection } from '@/server/types';
import validatorService from '@/services/validator-service';
import SubDescription from '@/components/sub-description';

interface PageProps {
  params: NextPageWithLocale & { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }) {
  const t = await getTranslations({ locale, namespace: 'ValidatorGovernancePage' });

  return {
    title: t('title'),
  };
}

const defaultPerPage = 1;

const ValidatorGovernancePage: NextPageWithLocale<PageProps> = async ({ params: { locale, id }, searchParams: q }) => {
  const t = await getTranslations({ locale, namespace: 'ValidatorGovernancePage' });

  const validatorId = parseInt(id);
  const currentPage = parseInt((q.p as string) || '1');
  const perPage = q.pp ? parseInt(q.pp as string) : defaultPerPage;
  const sortBy = (q.sortBy as 'name') ?? 'name';
  const order = (q.order as SortDirection) ?? 'asc';

  const validator = await validatorService.getById(validatorId);
  const validatorMoniker = validator ? validator.moniker : 'Validator';

  return (
    <div className="mb-10">
      <PageTitle prefix={`${validatorMoniker}`} text={t('title')} />
      <SubDescription text={t('description')} contentClassName={'m-4'} plusClassName={'mt-2'} />
      <div className="mb-20 mt-6">
        <ToolTip tooltip={t('tooltip created proposals')} direction={'top'}>
          <SubTitle text={t('proposals')} size="h2" />
        </ToolTip>
        <div className="mt-6 flex justify-center">
          <ValidatorCreatedProposalsBar />
        </div>
      </div>
      <div>
        <ToolTip tooltip={t('tooltip news feed')} direction={'top'}>
          <SubTitle text={t('news feed')} size="h2" />
        </ToolTip>
        <div className="mb-4 mt-2 flex justify-end">
          <RoundedButton href={''} className="font-handjet text-lg">
            {t('similar opinions')}
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

export default ValidatorGovernancePage;
