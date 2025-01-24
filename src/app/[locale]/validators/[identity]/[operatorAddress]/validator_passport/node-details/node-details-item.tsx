import CopyButton from '@/components/common/copy-button';
import { FC } from 'react';

interface OwnProps {
  label: string;
  value: string;
  isCopy?: boolean;
}

const NodeDetailsItem: FC<OwnProps> = ({ label, value, isCopy=false }) => {
  return (
    <div className="grid grid-cols-2 items-center">
      <div className="border-b border-r border-bgSt py-4 pl-8 font-sfpro text-base">{label}</div>
      <div className="flex items-center gap-2 border-b border-bgSt py-4 pl-4 font-sfpro text-sm">
        <span>{value}</span>
        {isCopy && value && (
          <CopyButton value={value} />
        )}
      </div>
    </div>
  );
};

export default NodeDetailsItem;
