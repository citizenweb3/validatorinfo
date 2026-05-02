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
  sort: { sortBy: 'chain'; order: SortDirection };
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
    sort.order,
  );

  const totalPages = Math.ceil(totalCount / perPage);

  type NodeTitleKey =
    | 'rpc nodes'
    | 'rest nodes'
    | 'grpc nodes'
    | 'websocket nodes'
    | 'indexer nodes'
    | 'lcd nodes'
    | 'masp indexer nodes'
    | 'interface nodes'
    | 'others nodes';

  const nodeTypeMapping: Record<string, NodeTitleKey> = {
    rpc: 'rpc nodes',
    rest: 'rest nodes',
    grpc: 'grpc nodes',
    ws: 'websocket nodes',
    indexer: 'indexer nodes',
    lcd: 'lcd nodes',
    'masp-indexer': 'masp indexer nodes',
    interface: 'interface nodes',
  };

  const nodesList = Object.entries(groupedByType)
    .map(([type, typeNodes]) => ({
      title: nodeTypeMapping[type] ?? ('others nodes' as NodeTitleKey),
      type: type,
      nodes: typeNodes as InfrastructureNode[],
    }))
    .sort((a, b) => {
      const isALast = a.type === 'grpc' || a.type === 'ws' || a.type === 'interface';
      const isBLast = b.type === 'grpc' || b.type === 'ws' || b.type === 'interface';

      if (isALast && !isBLast) return 1;
      if (!isALast && isBLast) return -1;
      return 0;
    });

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
