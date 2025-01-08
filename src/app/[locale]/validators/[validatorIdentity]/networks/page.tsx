import { getTranslations } from 'next-intl/server';

import ValidatorProfile from '@/app/validators/[validatorIdentity]/validator-profile/validator-profile';
import { validatorExample } from '@/app/validators/[validatorIdentity]/validatorExample';
import ValidatorNetworks from '@/app/validators/[validatorIdentity]/networks/validator-networks/validator-networks';
import PageTitle from '@/components/common/page-title';
import TabList from '@/components/common/tabs/tab-list';
import { getValidatorProfileTabs } from '@/components/common/tabs/tabs-data';
import { NextPageWithLocale } from '@/i18n';
import { SortDirection } from '@/services/validator-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: NextPageWithLocale;
  searchParams: { [key: string]: string | string[] | undefined };
}

const defaultPerPage = 1;

const ValidatorNetworksPage: NextPageWithLocale<PageProps> = async ({ params: { locale }, searchParams: q }) => {
  const t = await getTranslations({ locale, namespace: 'ValidatorNetworksPage' });
  const currentPage = parseInt((q.p as string) || '1');
  const perPage = q.pp ? parseInt(q.pp as string) : defaultPerPage;
  const sortBy = (q.sortBy as 'name') ?? 'name';
  const order = (q.order as SortDirection) ?? 'asc';

  return (
    <div>
      <PageTitle prefix={`${validatorExample.name}:`} text={t('title')} />
      <ValidatorNetworks
        page="ValidatorNetworksPage"
        perPage={perPage}
        currentPage={currentPage}
        sort={{ sortBy, order }}
      />
    </div>
  );
};

export default ValidatorNetworksPage;
