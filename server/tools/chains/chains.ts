import { chainParamsArray } from '@/server/tools/chains/params';

const chainNames = chainParamsArray.map((chain) => chain.name).filter((chainName) => chainName);
export default chainNames;
