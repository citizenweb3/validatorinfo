import { Chain, ChainNode, ChainParams, Node, Prisma } from '@prisma/client';
import db from '@/db';
import { SortDirection } from '@/server/types';

import ChainNodeWhereInput = Prisma.ChainNodeWhereInput;
import ChainNodeOrderByWithRelationInput = Prisma.ChainNodeOrderByWithRelationInput;

export type InfrastructureNode = ChainNode & {
  chain: Chain & { params: ChainParams | null };
  node: Node;
};

export type InfrastructureResponse = {
  nodes: InfrastructureNode[];
  totalCount: number;
  groupedByType: Record<string, InfrastructureNode[]>;
};

const getValidatorInfrastructure = async (
  validatorId: number,
  ecosystems?: string[],
  page: number = 1,
  perPage: number = 50,
  order: SortDirection = 'asc',
): Promise<InfrastructureResponse> => {
  try {
    const where: ChainNodeWhereInput = {
      nodeId: { not: null },
      node: {
        validatorId: validatorId,
      },
    };

    if (ecosystems && ecosystems.length > 0) {
      where.chain = {
        ecosystem: { in: ecosystems },
      };
    }

    const totalCount = await db.chainNode.count({ where });

    const orderBy: ChainNodeOrderByWithRelationInput[] = [
      { chain: { name: order } },
      { type: 'asc' },
    ];

    const nodes = (await db.chainNode.findMany({
      where,
      include: {
        chain: {
          include: {
            params: true,
          },
        },
        node: true,
      },
      orderBy,
      skip: (page - 1) * perPage,
      take: perPage,
    })) as InfrastructureNode[];

    const groupedByType: Record<string, InfrastructureNode[]> = {};
    nodes.forEach((node) => {
      const type = node.type || 'unknown';
      if (!groupedByType[type]) {
        groupedByType[type] = [];
      }
      groupedByType[type].push(node);
    });

    return {
      nodes,
      totalCount,
      groupedByType,
    };
  } catch (e) {
    return {
      nodes: [],
      totalCount: 0,
      groupedByType: {},
    };
  }
};

const getValidatorInfrastructureTypes = async (validatorId: number): Promise<string[]> => {
  try {
    const types = await db.chainNode.findMany({
      where: {
        nodeId: { not: null },
        node: {
          validatorId: validatorId,
        },
      },
      select: {
        type: true,
      },
      distinct: ['type'],
    });

    return types.map((t) => t.type).filter(Boolean) as string[];
  } catch (e) {
    return [];
  }
};

const getValidatorInfrastructureStats = async (validatorId: number) => {
  try {
    const stats = await db.chainNode.groupBy({
      by: ['type'],
      where: {
        nodeId: { not: null },
        node: {
          validatorId: validatorId,
        },
      },
      _count: {
        id: true,
      },
    });

    const totalNodes = stats.reduce((sum, stat) => sum + stat._count.id, 0);

    const byType = stats.reduce(
      (acc, stat) => {
        acc[stat.type] = stat._count.id;
        return acc;
      },
      {} as Record<string, number>,
    );

    const uniqueChains = await db.chainNode.findMany({
      where: {
        nodeId: { not: null },
        node: {
          validatorId: validatorId,
        },
      },
      select: {
        chainId: true,
      },
      distinct: ['chainId'],
    });

    return {
      totalNodes,
      byType,
      uniqueChains: uniqueChains.length,
    };
  } catch (e) {
    return {
      totalNodes: 0,
      byType: {},
      uniqueChains: 0,
    };
  }
};

const infrastructureService = {
  getValidatorInfrastructure,
  getValidatorInfrastructureTypes,
  getValidatorInfrastructureStats,
};

export default infrastructureService;
