import { ChainMethods } from '@/server/tools/chains/chain-indexer';
import cosmosChainMethods from '@/server/tools/chains/cosmoshub/methods';
import getApr from '@/server/tools/chains/nomic/get-apr';
import getTvl from '@/server/tools/chains/nomic/get-tvl';

const chainMethods: ChainMethods = { ...cosmosChainMethods, getTvl, getApr };

export default chainMethods;
