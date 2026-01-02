import logger from '@/logger';
import getCurrentEpoch from '@/server/tools/chains/aztec/utils/get-current-epoch';
import getCurrentSlot from '@/server/tools/chains/aztec/utils/get-current-slot';
import getEpochDuration from '@/server/tools/chains/aztec/utils/get-epoch-duration';

const { logError } = logger('get-epoch-progress');

export interface EpochProgress {
  currentEpoch: number;
  currentSlot: number;
  epochDuration: number;
  slotsIntoEpoch: number;
  slotsRemaining: number;
  progress: number;
}

const getEpochProgress = async (chainName: string): Promise<EpochProgress | null> => {
  try {
    const [currentEpoch, currentSlot, epochDuration] = await Promise.all([
      getCurrentEpoch(chainName),
      getCurrentSlot(chainName),
      getEpochDuration(chainName),
    ]);

    if (currentEpoch === null || currentSlot === null || epochDuration === null) {
      logError(`${chainName} - missing data for epoch progress calculation`);
      return null;
    }

    const epochNum = Number(currentEpoch);
    const slotNum = Number(currentSlot);
    const durationNum = Number(epochDuration);

    if (durationNum === 0) {
      logError(`${chainName} - epoch duration is zero`);
      return null;
    }

    const epochStartSlot = epochNum * durationNum;
    const slotsIntoEpoch = slotNum - epochStartSlot;
    const slotsRemaining = durationNum - slotsIntoEpoch;
    const progress = Math.min(Math.max((slotsIntoEpoch / durationNum) * 100, 0), 100);

    return {
      currentEpoch: epochNum,
      currentSlot: slotNum,
      epochDuration: durationNum,
      slotsIntoEpoch,
      slotsRemaining,
      progress,
    };
  } catch (e) {
    logError(`${chainName} - can't calculate epoch progress`);
    return null;
  }
};

export default getEpochProgress;
