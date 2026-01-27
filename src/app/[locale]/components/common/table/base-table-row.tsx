import { FC, ReactNode } from 'react';
import { cn } from '@/utils/cn';

const BASE_ROW_CLASSES = 'group bg-table_row font-handjet shadow-md hover:bg-table_header';

interface BaseTableRowProps {
  children: ReactNode;
  className?: string;
}

const BaseTableRow: FC<BaseTableRowProps> = ({ children, className }) => {
  return (
    <tr className={cn(BASE_ROW_CLASSES, className)}>
      {children}
    </tr>
  );
};

export default BaseTableRow;
