import { FC } from 'react';

interface OwnProps {
  label: string;
  value: string;
}

const NodeDetailsItem: FC<OwnProps> = ({ label, value }) => {
  return (
    <div className="grid grid-cols-2">
      <div className="font-sfpro text-base border-b border-r border-bgSt py-4 pl-8">{label}</div>
      <div className="font-sfpro text-sm border-b border-bgSt py-4 pl-4">{value}</div>
    </div>
  );
}

export default NodeDetailsItem;
