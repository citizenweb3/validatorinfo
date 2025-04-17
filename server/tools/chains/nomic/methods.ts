import { ChainMethods } from '@/server/tools/chains/chain-indexer';
import cosmosChainMethods from '@/server/tools/chains/cosmoshub/methods';
import getApr from '@/server/tools/chains/nomic/get-apr';
import getProposals from '@/server/tools/chains/nomic/get-proposals';
import getTvs from '@/server/tools/chains/nomic/get-tvs';

const chainMethods: ChainMethods = { ...cosmosChainMethods, getTvs, getApr, getProposals };

export default chainMethods;
