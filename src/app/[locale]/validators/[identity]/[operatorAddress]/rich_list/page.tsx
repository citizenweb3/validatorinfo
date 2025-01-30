import { getTranslations } from 'next-intl/server';

import NodePagesTitle from '@/app/validators/[identity]/[operatorAddress]/node-pages-title';
import DelegatedTable from '@/app/validators/[identity]/[operatorAddress]/rich_list/delegated-table/delegated-table';
import SwitchClient from '@/components/common/switch-client';
import { Locale, NextPageWithLocale } from '@/i18n';
import ValidatorService, { SortDirection } from '@/services/validator-service';

interface PageProps {
  params: NextPageWithLocale & { identity: string; operatorAddress: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }) {
  const t = await getTranslations({ locale, namespace: 'RichListPage' });

  return {
    title: t('title'),
  };
}

const defaultPerPage = 1;

const RichListPage: NextPageWithLocale<PageProps> = async ({
  params: { locale, identity, operatorAddress },
  searchParams: q,
}) => {
  const t = await getTranslations({ locale, namespace: 'RichListPage' });
  const currentPage = parseInt((q.p as string) || '1');
  const perPage = q.pp ? parseInt(q.pp as string) : defaultPerPage;
  const sortBy = (q.sortBy as 'name') ?? 'name';
  const order = (q.order as SortDirection) ?? 'asc';

  const { validatorNodesWithChainData: list } = await ValidatorService.getValidatorNodesWithChains(identity);
  const node = list.find((item) => item.operator_address === operatorAddress);

  return (
    <div className="mb-14">
      <NodePagesTitle page={'RichListPage'} locale={locale} node={node} />
      <div className="mb-4 mt-7 flex h-5 flex-row items-center justify-end space-x-2 text-lg uppercase">
        <div className="border-b border-bgSt px-2 font-handjet font-light">USD</div>
        <SwitchClient value={true} />
        <div className="border-b border-bgSt px-2 font-handjet font-light">{t('token')}</div>
      </div>
      <DelegatedTable page={'RichListPage'} perPage={perPage} currentPage={currentPage} sort={{ sortBy, order }} />
    </div>
  );
};

export default RichListPage;
