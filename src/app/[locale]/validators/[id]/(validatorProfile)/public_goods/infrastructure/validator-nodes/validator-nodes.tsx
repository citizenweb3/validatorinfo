import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import NetworkNodesDropdown from '@/app/validators/[id]/(validatorProfile)/public_goods/infrastructure/validator-nodes/network-nodes-dropdown';
import ValidatorNodesTable from '@/app/validators/[id]/(validatorProfile)/public_goods/infrastructure/validator-nodes/validator-nodes-table';
import { validatorExample } from '@/app/validators/[id]/(validatorProfile)/validatorExample';
import SubTitle from '@/components/common/sub-title';
import { SortDirection } from '@/server/types';
import { PagesProps } from '@/types';

interface OwnProps extends PagesProps {
  perPage: number;
  currentPage?: number;
  sort: { sortBy: string; order: SortDirection };
  locale: string;
}

const ValidatorNodes: FC<OwnProps> = async ({ page, perPage, sort, currentPage, locale }) => {
  const t = await getTranslations({ locale, namespace: page });

  const nodesList = [
    { title: 'rpc nodes', type: validatorExample.rpcNodes },
    { title: 'relayer nodes', type: validatorExample.relayerNodes },
    { title: 'archive nodes', type: validatorExample.archiveNodes },
    { title: 'others nodes', type: validatorExample.othersNodes },
  ];

  return (
    <div>
      <div className="mt-8 flex justify-end">
        <NetworkNodesDropdown />
      </div>
      {nodesList.map((nodeType) => (
        <div key={nodeType.title}>
          <SubTitle text={t(nodeType.title)} size="h2" />
          <ValidatorNodesTable
            nodes={nodeType.type}
            page={page}
            perPage={perPage}
            sort={sort}
            currentPage={currentPage}
          />
        </div>
      ))}
    </div>
  );
};

export default ValidatorNodes;
