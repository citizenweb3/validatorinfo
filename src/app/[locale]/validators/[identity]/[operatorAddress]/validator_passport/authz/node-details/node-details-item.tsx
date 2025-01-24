import Image from 'next/image';
import { FC } from 'react';

import CopyButton from '@/components/common/copy-button';
import icons from '@/components/icons';

interface OwnProps {
  label: string;
  value?: string;
  isCopy?: boolean;
  isCheckmark?: boolean;
}

const NodeDetailsItem: FC<OwnProps> = ({ label, value, isCopy = false, isCheckmark = false }) => {
  const cutValue = (value: string, maxLength: number): string => {
    if (value.length <= maxLength) {
      return value;
    }
    const start = value.slice(0, 7);
    const end = value.slice(-7);
    return `${start}...${end}`;
  };

  return (
    <div className="flex w-full flex-wrap mt-2">
      <div className="w-7/12 border-b border-r border-bgSt pl-8 py-4 font-sfpro text-lg items-center">{label}</div>
      <div className="flex w-5/12 justify-between gap-2 border-b border-bgSt pl-6 py-4 pr-4 font-handjet text-lg items-center">
        {isCheckmark ? (
          <Image src={icons.CheckmarkIcon} alt="Infrastructure is active" width={30} height={30} />
        ) : value ? (
          <>
            {cutValue(value, 20)}
            {isCopy && <CopyButton value={value} size="md" />}
          </>
        ) : null}
      </div>
    </div>
  );
};

export default NodeDetailsItem;
