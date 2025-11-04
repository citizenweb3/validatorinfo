import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import NetworkNodesDropdown from '@/app/validators/[id]/(validator-profile)/public_goods/infrastructure/validator-nodes/network-nodes-dropdown';
import ValidatorNodesTable from '@/app/validators/[id]/(validator-profile)/public_goods/infrastructure/validator-nodes/validator-nodes-table';
import SubTitle from '@/components/common/sub-title';
import { SortDirection } from '@/server/types';
import infrastructureService, { InfrastructureNode } from '@/services/infrastructure-service';
import { PagesProps } from '@/types';

interface OwnProps extends PagesProps {
  validatorId: number;
  perPage: number;
  currentPage?: number;
  sort: { sortBy: 'chain' | 'type' | 'responseTime' | 'lastCheckedAt'; order: SortDirection };
  ecosystems?: string[];
  locale: string;
}

const ValidatorNodes: FC<OwnProps> = async ({
  page,
  validatorId,
  perPage,
  sort,
  currentPage = 1,
  ecosystems,
  locale,
}) => {
  const t = await getTranslations({ locale, namespace: page });

  const { nodes, totalCount, groupedByType } = await infrastructureService.getValidatorInfrastructure(
    validatorId,
    ecosystems,
    currentPage,
    perPage,
    sort.sortBy,
    sort.order,
  );

  const totalPages = Math.ceil(totalCount / perPage);

  const nodeTypeMapping: Record<string, string> = {
    rpc: 'rpc nodes',
    rest: 'rest nodes',
    grpc: 'grpc nodes',
    ws: 'websocket nodes',
    indexer: 'indexer nodes',
    lcd: 'lcd nodes',
  };

  const nodesList = Object.entries(groupedByType).map(([type, typeNodes]) => ({
    title: nodeTypeMapping[type] || `${type} nodes`,
    type: type,
    nodes: typeNodes as InfrastructureNode[],
  }));

  if (nodes.length === 0) {
    return (
      <div>
        <div className="mt-8 flex justify-end">
          <NetworkNodesDropdown />
        </div>
        <div className="mt-12 text-center font-sfpro text-lg">
          <p>{t('no infrastructure found')}</p>
          <p className="mt-5 text-base font-sfpro">{t('no infrastructure description')}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mt-4 flex justify-end">
        <NetworkNodesDropdown />
      </div>
      {nodesList.map((nodeType) => (
        <div key={nodeType.type}>
          <SubTitle text={t(nodeType.title)} size="h2" className={'my-4'} />
          <ValidatorNodesTable
            nodes={nodeType.nodes}
            page={page}
            perPage={perPage}
            sort={sort}
            currentPage={currentPage}
            totalPages={totalPages}
          />
        </div>
      ))}
    </div>
  );
};

export default ValidatorNodes;
