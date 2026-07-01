import { FC } from 'react';

import BaseTableRow from '@/components/common/table/base-table-row';
import BaseTableCell from '@/components/common/table/base-table-cell';

interface OwnProps {
  rows?: number;
}

const widths = ['w-24', 'w-28', 'w-40', 'w-20'];

// Pulse-row placeholder for the tx table body. Custom palette only (`bg-primary`), no inline styles —
// mirrors network-overview-skeleton. Used both as the <Suspense> fallback (server) and as the
// in-window placeholder while a batch is loading (client).
const TxRowsSkeleton: FC<OwnProps> = ({ rows = 20 }) => (
  <tbody>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <BaseTableRow key={rowIndex}>
        {widths.map((width, cellIndex) => (
          <BaseTableCell key={cellIndex} hoverable={false} className="w-1/4 py-4">
            <div className="flex justify-center">
              <div className={`h-5 ${width} animate-pulse rounded bg-primary`} />
            </div>
          </BaseTableCell>
        ))}
      </BaseTableRow>
    ))}
  </tbody>
);

export default TxRowsSkeleton;
