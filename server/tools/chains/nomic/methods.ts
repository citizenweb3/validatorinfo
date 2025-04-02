import { ChainMethods } from '@/server/tools/chains/chain-indexer';
import cosmosChainMethods from '@/server/tools/chains/cosmoshub/methods';
import getApr from '@/server/tools/chains/nomic/get-apr';
import getProposals from '@/server/tools/chains/nomic/get-proposals';
import getTvl from '@/server/tools/chains/nomic/get-tvl';

const chainMethods: ChainMethods = { ...cosmosChainMethods, getTvl, getApr, getProposals };

export default chainMethods;
