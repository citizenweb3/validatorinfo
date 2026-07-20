import { FC } from 'react';

import BaseTableCell from '@/components/common/table/base-table-cell';
import BaseTableRow from '@/components/common/table/base-table-row';

interface OwnProps {
  rows?: number;
}

const widths = ['w-32', 'w-24', 'w-28', 'w-20'];

const DelegationsRowsSkeleton: FC<OwnProps> = ({ rows = 8 }) => (
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

export default DelegationsRowsSkeleton;
