import { getTranslations } from 'next-intl/server';

import ValidatorNodes from '@/app/validators/[identity]/public_good/infrastructure/validator-nodes/validator-nodes';
import RoundedButton from '@/components/common/rounded-button';
import { NextPageWithLocale } from '@/i18n';
import { SortDirection } from '@/services/validator-service';

interface PageProps {
  params: NextPageWithLocale & { identity: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

const defaultPerPage = 1;

const PublicGoodInfrastructurePage: NextPageWithLocale<PageProps> = async ({
  params: { locale, identity },
  searchParams: q,
}) => {
  const t = await getTranslations({ locale, namespace: 'PublicGoodInfrastructurePage' });

  const currentPage = parseInt((q.p as string) || '1');
  const perPage = q.pp ? parseInt(q.pp as string) : defaultPerPage;
  const sortBy = (q.sortBy as 'name') ?? 'name';
  const order = (q.order as SortDirection) ?? 'asc';

  return (
    <div className="mb-28">
      <div className="mb-7 ml-4 mt-12 font-sfpro text-base">{t('description')}</div>
      <div className="mb-3 mt-4 flex justify-end">
        <RoundedButton href={''} className="font-handjet text-base">
          {t('submit new info')}
        </RoundedButton>
      </div>
      <ValidatorNodes
        page={'PublicGoodInfrastructurePage'}
        perPage={perPage}
        currentPage={currentPage}
        sort={{ sortBy, order }}
        locale={locale}
      />
    </div>
  );
};

export default PublicGoodInfrastructurePage;
