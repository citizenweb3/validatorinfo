import { FC, ReactNode } from 'react';
import { cn } from '@/utils/cn';

const CELL_HOVER_CLASSES = 'relative outline-none border border-transparent hover:bg-[#272727] hover:shadow-[0_4px_12px_rgba(0,0,0,0.6),0_8px_20px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)] hover:rounded-sm hover:z-10 hover:scale-y-[1.05]';

const CELL_ACTIVE_CLASSES = 'active:bg-table_row active:shadow-none active:border-bgSt active:scale-95 active:rounded-sm';

interface BaseTableCellProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
}

const BaseTableCell: FC<BaseTableCellProps> = ({
  children,
  className,
  hoverable = true
}) => {
  return (
    <td className={cn(
      hoverable && CELL_HOVER_CLASSES,
      hoverable && CELL_ACTIVE_CLASSES,
      className
    )}>
      {children}
    </td>
  );
};

export default BaseTableCell;
