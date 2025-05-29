import icons from '@/components/icons';
import { VoteOption } from '@prisma/client';

const redTextLayout: string = '#EB1616';
const greenTextLayout: string = '#4FB848';
const yellowTextLayout: string = '#E5C46B';

const delegation = (selfDelegation: number | null) => {
  if (Number(selfDelegation) < 1000) {
    return greenTextLayout;
  } else if (Number(selfDelegation) < 2000 && Number(selfDelegation) >= 1000) {
    return yellowTextLayout;
  } else {
    return redTextLayout;
  }
};

const uptime = (uptime: number | null) => {
  if (uptime != null) {
    if (uptime <= 90) {
      return redTextLayout;
    } else if (uptime >= 90 && uptime <= 98) {
      return yellowTextLayout;
    } else {
      return greenTextLayout;
    }
  }
};

const missedBlocks = (missedBlocks: number | null) => {
  if (missedBlocks != null) {
    if (missedBlocks < 200) {
      return greenTextLayout;
    } else if (missedBlocks >= 200 && missedBlocks <= 1000) {
      return yellowTextLayout;
    } else {
      return redTextLayout;
    }
  }
};

const getVotesIcon = (vote: VoteOption) => {
  switch (vote) {
    case 'YES':
      return icons.GreenSquareIcon;
    case 'NO':
      return icons.RedSquareIcon;
    case 'ABSTAIN':
      return icons.YellowSquareIcon;
    default:
      return icons.GreenSquareIcon;
  }
};

const colorStylization = {
  delegation,
  uptime,
  missedBlocks,
  getVotesIcon,
};

export default colorStylization;
