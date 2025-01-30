import { getTranslations } from 'next-intl/server';

import ValidatorCreatedProposalsBar from '@/app/validators/[identity]/(validatorProfile)/governance/created-proposals-bar';
import ValidatorVotes from '@/app/validators/[identity]/(validatorProfile)/governance/validator-votes/validator-votes';
import PageTitle from '@/components/common/page-title';
import RoundedButton from '@/components/common/rounded-button';
import SubTitle from '@/components/common/sub-title';
import ToolTip from '@/components/common/tooltip';
import { Locale, NextPageWithLocale } from '@/i18n';
import ValidatorService, { SortDirection } from '@/services/validator-service';

interface PageProps {
  params: NextPageWithLocale & { identity: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }) {
  const t = await getTranslations({ locale, namespace: 'ValidatorGovernancePage' });

  return {
    title: t('title'),
  };
}

const defaultPerPage = 1;

const ValidatorGovernancePage: NextPageWithLocale<PageProps> = async ({
  params: { locale, identity },
  searchParams: q,
}) => {
  const t = await getTranslations({ locale, namespace: 'ValidatorGovernancePage' });

  const currentPage = parseInt((q.p as string) || '1');
  const perPage = q.pp ? parseInt(q.pp as string) : defaultPerPage;
  const sortBy = (q.sortBy as 'name') ?? 'name';
  const order = (q.order as SortDirection) ?? 'asc';

  const validator = await ValidatorService.getValidatorByIdentity(identity);
  const validatorMoniker = validator ? validator.moniker : 'Validator';

  return (
    <div className="mb-10">
      <PageTitle prefix={`${validatorMoniker}:`} text={t('title')} />
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
        <div className="my-4 flex justify-end">
          <RoundedButton href={''} className="font-handjet text-base font-light">
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
