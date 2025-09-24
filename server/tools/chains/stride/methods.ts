import { ChainMethods } from '@/server/tools/chains/chain-indexer';
import cosmosChainMethods from '@/server/tools/chains/cosmoshub/methods';
import getApr from '@/server/tools/chains/stride/get-apr';
import getInflationRate from "@/server/tools/chains/osmosis/get-inflation-rate";

const chainMethods: ChainMethods = {
    ...cosmosChainMethods,
    getApr,
    getInflationRate
};

export default chainMethods;
