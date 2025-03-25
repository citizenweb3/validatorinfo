import { chainParamsArray } from '@/server/tools/chains/params';

const chainNames = chainParamsArray.map((chain) => chain.name).filter((chain) => chain);
export default chainNames;
