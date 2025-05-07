import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate';

import { GetGovParamsFunction, GovParams } from '@/server/tools/chains/chain-indexer';

const NEUTRON_DAO_CORE_CONTRACT = 'neutron1suhgf5svhu4usrurvxzlgn54ksxmn8gljarjtxqnapv8kjnp4nrstdxvff';
const NEUTRON_DAO_PROPOSALS_CONTRACT = 'neutron1436kxs0w2es6xlqpp9rd35e3d0cjnw4sv8j3a7483sgks29jqwgshlt6zh';

const getGovParams: GetGovParamsFunction = async (chain) => {
  const rpcEndpoint = chain.nodes.find((node) => node.type === 'rpc')?.url;

  if (!rpcEndpoint) {
    throw new Error('RPC endpoint not found');
  }

  const result: GovParams = {
    proposalDeposit: null,
    votingPeriod: null,
    minDeposit: null,
    quorum: null,
    threshold: null,
  };

  try {
    const client = await CosmWasmClient.connect(rpcEndpoint);

    const daoResponse = await client.queryContractSmart(NEUTRON_DAO_CORE_CONTRACT, {
      proposal_modules: {},
    });

    const mainModule = daoResponse.find((mod: any) => mod.address === NEUTRON_DAO_PROPOSALS_CONTRACT);

    try {
      const config = await client.queryContractSmart(mainModule.address, { config: {} });
      result.votingPeriod = config.max_voting_period?.time || 604800;
    } catch (error) {
      console.error(`Error fetching config for module ${mainModule.address}:`, error);
    }
  } catch (error) {
    console.error('Error fetching voting period:', error);
  }

  return result;
};

export default getGovParams;
