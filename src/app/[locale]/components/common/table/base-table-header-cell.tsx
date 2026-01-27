'use client';

import { FC, ReactNode } from 'react';

import { cn } from '@/utils/cn';

const BASE_HEADER_CELL_CLASSES =
  'text-center bg-table_row bg-clip-padding shadow-[0_4px_4px_rgba(0,0,0,0.8)] border-x-2 border-transparent';

interface OwnProps {
  children: ReactNode;
  className?: string;
  colSpan?: number;
  onClick?: () => void;
}

const BaseTableHeaderCell: FC<OwnProps> = ({ children, className, colSpan = 1, onClick }) => {
  return (
    <th
      className={cn(BASE_HEADER_CELL_CLASSES, onClick && 'cursor-pointer', className)}
      colSpan={colSpan}
      onClick={onClick}
    >
      {children}
    </th>
  );
};

export default BaseTableHeaderCell;
