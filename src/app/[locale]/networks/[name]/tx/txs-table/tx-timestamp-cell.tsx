import { FC } from 'react';

import { aztecIndexer } from '@/services/aztec-indexer-api';
import { formatTimestamp } from '@/utils/format-timestamp';

interface OwnProps {
  blockHeight: number | string;
}

const TxTimestampCell: FC<OwnProps> = async ({ blockHeight }) => {
  const block = await aztecIndexer.getBlockByHeight(Number(blockHeight), { cache: 'no-store' });

  if (!block) {
    return <span className="font-sfpro text-base">-</span>;
  }

  const timestamp = formatTimestamp(new Date(block.header.globalVariables.timestamp));

  return <span className="font-sfpro text-base">{timestamp}</span>;
};

export default TxTimestampCell;
