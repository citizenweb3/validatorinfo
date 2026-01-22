import { FC, ReactNode } from 'react';
import { cn } from '@/utils/cn';

const BASE_TABLE_CLASSES = 'relative w-full table-auto border-separate border-spacing-y-2';

interface BaseTableProps {
  children: ReactNode;
  className?: string;
}

const BaseTable: FC<BaseTableProps> = ({ children, className }) => {
  return (
    <table className={cn(BASE_TABLE_CLASSES, className)}>
      {children}
    </table>
  );
};

export default BaseTable;
