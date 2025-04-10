import { ChainMethods } from '@/server/tools/chains/chain-indexer';
import cosmosChainMethods from '@/server/tools/chains/cosmoshub/methods';
import getApr from '@/server/tools/chains/neutron/get-apr';
import getTvl from '@/server/tools/chains/neutron/get-tvl';

const chainMethods: ChainMethods = { ...cosmosChainMethods, getApr, getTvl };

export default chainMethods;
