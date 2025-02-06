import { getTranslations } from 'next-intl/server';

import ValidatorMediasList from '@/app/validators/[id]/public_goods/media/validator-medias-list';
import RoundedButton from '@/components/common/rounded-button';
import { NextPageWithLocale } from '@/i18n';
import { SortDirection } from '@/services/validator-service';

interface PageProps {
  params: NextPageWithLocale & { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

const defaultPerPage = 1;

const PublicGoodsMediaPage: NextPageWithLocale<PageProps> = async ({ params: { locale, id }, searchParams: q }) => {
  const t = await getTranslations({ locale, namespace: 'PublicGoodsMediaPage' });

  const currentPage = parseInt((q.p as string) || '1');
  const perPage = q.pp ? parseInt(q.pp as string) : defaultPerPage;
  const sortBy = (q.sortBy as 'name') ?? 'name';
  const order = (q.order as SortDirection) ?? 'asc';

  return (
    <div>
      <div className="mb-7 ml-4 mt-12 font-sfpro text-base">{t('description')}</div>
      <div className="mb-3 mt-4 flex justify-end">
        <RoundedButton href={''} className="font-handjet text-base">
          {t('submit new info')}
        </RoundedButton>
      </div>
      <ValidatorMediasList perPage={perPage} currentPage={currentPage} sort={{ sortBy, order }} />
    </div>
  );
};

export default PublicGoodsMediaPage;
