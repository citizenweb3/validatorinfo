import getCurrentEpoch from '@/server/tools/chains/aztec/utils/get-current-epoch';
import getCurrentSlot from '@/server/tools/chains/aztec/utils/get-current-slot';

const getLatestSlot = async (chainName: string) => {
  const latestSlot = await getCurrentSlot(chainName);
  if (!latestSlot) {
    return null;
  }
  return String(latestSlot);
};

const getLatestEpoch = async (chainName: string) => {
  const latestEpoch = await getCurrentEpoch(chainName);
  if (!latestEpoch) {
    return null;
  }
  return String(latestEpoch);
};

const aztecContractService = {
  getLatestSlot,
  getLatestEpoch,
};

export default aztecContractService;
