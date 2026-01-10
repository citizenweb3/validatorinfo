import getActiveAttesterCountUtil from '@/server/tools/chains/aztec/utils/get-active-attester-count';
import getCommitteeSizeUtil from '@/server/tools/chains/aztec/utils/get-committee-size';
import getCurrentEpoch from '@/server/tools/chains/aztec/utils/get-current-epoch';
import getCurrentSlot from '@/server/tools/chains/aztec/utils/get-current-slot';
import getEpochProgressUtil, { EpochProgress } from '@/server/tools/chains/aztec/utils/get-epoch-progress';

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

const getActiveAttesterCount = async (chainName: string) => {
  const activeAttesterCount = await getActiveAttesterCountUtil(chainName);
  if (!activeAttesterCount) {
    return null;
  }
  return Number(activeAttesterCount);
};

const getCommitteeSize = async (chainName: string) => {
  const comitteeSize = await getCommitteeSizeUtil(chainName);
  if (!comitteeSize) {
    return null;
  }
  return Number(comitteeSize);
};

const getEpochProgress = async (chainName: string): Promise<EpochProgress | null> => {
  return getEpochProgressUtil(chainName);
};

const aztecContractService = {
  getLatestSlot,
  getLatestEpoch,
  getActiveAttesterCount,
  getEpochProgress,
  getCommitteeSize,
};

export default aztecContractService;
