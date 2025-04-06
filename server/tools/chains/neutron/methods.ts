import { ChainMethods } from '@/server/tools/chains/chain-indexer';
import cosmosChainMethods from '@/server/tools/chains/cosmoshub/methods';
import getApr from '@/server/tools/chains/neutron/get-apr';
import getProposals from '@/server/tools/chains/neutron/get-proposals';
import getTvl from '@/server/tools/chains/neutron/get-tvl';

const chainMethods: ChainMethods = { ...cosmosChainMethods, getApr, getTvl, getProposals };

export default chainMethods;
