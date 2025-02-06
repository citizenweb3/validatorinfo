import { getTranslations } from 'next-intl/server';

import ValidatorNetworks from '@/app/validators/[id]/networks/validator-networks/validator-networks';
import PageTitle from '@/components/common/page-title';
import { Locale, NextPageWithLocale } from '@/i18n';
import validatorService, { SortDirection } from '@/services/validator-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: NextPageWithLocale & { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }) {
  const t = await getTranslations({ locale, namespace: 'ValidatorNetworksPage' });

  return {
    title: t('title'),
  };
}

const ValidatorNetworksPage: NextPageWithLocale<PageProps> = async ({ params: { locale, id }, searchParams: q }) => {
  const t = await getTranslations({ locale, namespace: 'ValidatorNetworksPage' });
  const validatorId = parseInt(id);
  const validator = await validatorService.getById(validatorId);
  const validatorMoniker = validator ? validator.moniker : 'Validator';

  const sortBy = (q.sortBy as 'prettyName') ?? 'prettyName';
  const order = (q.order as SortDirection) ?? 'asc';

  return (
    <div>
      <PageTitle prefix={`${validatorMoniker}:`} text={t('title')} />
      <ValidatorNetworks id={validatorId} page="ValidatorNetworksPage" sort={{ sortBy, order }} />
    </div>
  );
};

export default ValidatorNetworksPage;
