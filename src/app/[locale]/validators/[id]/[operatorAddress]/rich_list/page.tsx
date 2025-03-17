import { getTranslations } from 'next-intl/server';
import DelegatedTable from '@/app/validators/[id]/[operatorAddress]/rich_list/delegated-table/delegated-table';
import SwitchClient from '@/components/common/switch-client';
import { NextPageWithLocale } from '@/i18n';
import { SortDirection } from '@/server/types';
import validatorService from '@/services/validator-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: NextPageWithLocale & { id: string; operatorAddress: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

const defaultPerPage = 1;

const RichListPage: NextPageWithLocale<PageProps> = async ({
                                                             params: { locale, id, operatorAddress },
                                                             searchParams: q,
                                                           }) => {
  const t = await getTranslations({ locale, namespace: 'RichListPage' });

  const validatorId = parseInt(id);
  const currentPage = parseInt((q.p as string) || '1');
  const perPage = q.pp ? parseInt(q.pp as string) : defaultPerPage;
  const sortBy = (q.sortBy as 'name') ?? 'name';
  const order = (q.order as SortDirection) ?? 'asc';

  const { validatorNodesWithChainData: list } = await validatorService.getValidatorNodesWithChains(validatorId);
  const node = list.find((item) => item.operatorAddress === operatorAddress);

  return (<div className="mb-14">
    <div className="mb-4 mt-7 flex h-5 flex-row items-center justify-end space-x-2 text-lg uppercase">
      <div className="border-b border-bgSt px-2 font-handjet">USD</div>
      <SwitchClient value={true} />
      <div className="border-b border-bgSt px-2 font-handjet">{t('token')}</div>
    </div>
    <DelegatedTable chainId={node?.chainId ?? 1} page={'RichListPage'} perPage={perPage} currentPage={currentPage}
                    sort={{ sortBy, order }} />
  </div>);
};

export default RichListPage;
