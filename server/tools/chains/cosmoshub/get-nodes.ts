import logger from '@/logger';
import { GetNodesFunction } from '@/server/tools/chains/chain-indexer';
import { NodeResult } from '@/server/types';
import fetchData from '@/server/utils/fetch-data';
import isUrlValid from '@/server/utils/is-url-valid';

const { logInfo, logError } = logger('ch-nodes');

const getNodes: GetNodesFunction = async (chain) => {
  const lcdUrl = chain.nodes.find((node) => node.type === 'lcd')?.url;
  if (!lcdUrl) {
    logError(`lcd node for ${chain.name} chain not found`);
    return [];
  }
  const validatorsUrl = `${lcdUrl}/cosmos/staking/v1beta1/validators?pagination.limit=10000&pagination.count_total=false`;

  try {
    logInfo(`${chain.name} validators - ${validatorsUrl}`);
    const nodes = (await fetchData<{ validators: NodeResult[] }>(validatorsUrl)).validators;

    for (const val of nodes) {
      if (val.description.identity && val.description.identity.length === 16) {
        let website = val.description.website;
        if (website) {
          website =
            val.description.website.indexOf('http') === 0
              ? val.description.website
              : `https://${val.description.website}`;

          val.description.website = isUrlValid(website) ? website : '';
        }
      }
    }
    return nodes;
  } catch (e) {
    logError(`Can't fetch cosmos nodes: ${validatorsUrl}`, e);
    return [];
  }
};

export default getNodes;
