import { getTranslations } from 'next-intl/server';

import ValidatorNetworks from '@/app/validators/[identity]/(profile)/networks/validator-networks/validator-networks';
import PageTitle from '@/components/common/page-title';
import { Locale, NextPageWithLocale } from '@/i18n';
import { SortDirection } from '@/services/validator-service';
import ValidatorService from '@/services/validator-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: NextPageWithLocale & { identity: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }) {
  const t = await getTranslations({ locale, namespace: 'ValidatorNetworksPage' });

  return {
    title: t('title'),
  };
}

const ValidatorNetworksPage: NextPageWithLocale<PageProps> = async ({
  params: { locale, identity },
  searchParams: q,
}) => {
  const t = await getTranslations({ locale, namespace: 'ValidatorNetworksPage' });
  const validator = await ValidatorService.getValidatorByIdentity(identity);
  const validatorMoniker = validator ? validator.moniker : 'Validator';

  const sortBy = (q.sortBy as 'prettyName') ?? 'prettyName';
  const order = (q.order as SortDirection) ?? 'asc';

  return (
    <div>
      <PageTitle prefix={`${validatorMoniker}:`} text={t('title')} />
      <ValidatorNetworks identity={identity} page="ValidatorNetworksPage" sort={{ sortBy, order }} />
    </div>
  );
};

export default ValidatorNetworksPage;
