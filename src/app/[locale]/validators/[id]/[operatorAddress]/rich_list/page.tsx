import { getTranslations } from 'next-intl/server';

import DelegatedTable from '@/app/validators/[id]/[operatorAddress]/rich_list/delegated-table/delegated-table';
import SubDescription from '@/components/sub-description';
import { NextPageWithLocale } from '@/i18n';
import validatorService from '@/services/validator-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: NextPageWithLocale & { id: string; operatorAddress: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

const RichListPage: NextPageWithLocale<PageProps> = async ({
  params: { locale, id, operatorAddress },
  searchParams: q,
}) => {
  const t = await getTranslations({ locale, namespace: 'RichListPage' });

  const validatorId = parseInt(id);
  const cursorToken = typeof q.c === 'string' ? q.c : undefined;
  const parsedWindowIndex = typeof q.w === 'string' ? parseInt(q.w, 10) : 0;
  const windowIndex = Number.isFinite(parsedWindowIndex) ? parsedWindowIndex : 0;

  const { validatorNodesWithChainData: list } = await validatorService.getValidatorNodesWithChains(validatorId);
  const node = list.find((item) => item.operatorAddress === operatorAddress);

  return (
    <div className="mb-14">
      <SubDescription text={t('description')} contentClassName={'m-4'} plusClassName={'mt-2'} />
      <DelegatedTable
        chainName={node?.chain.name ?? 'cosmoshub'}
        page={'RichListPage'}
        operatorAddress={operatorAddress}
        cursorToken={cursorToken}
        windowIndex={windowIndex}
      />
    </div>
  );
};

export default RichListPage;
