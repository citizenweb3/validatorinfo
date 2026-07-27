import Image from 'next/image';
import { FC } from 'react';

import CopyButton from '@/components/common/copy-button';
import icons from '@/components/icons';
import cutHash from '@/utils/cut-hash';
import Link from 'next/link';

interface OwnProps {
  label: string;
  value?: string;
  isCopy?: boolean;
  status?: boolean;
  link?: string;
}

const NodeDetailsItem: FC<OwnProps> = ({ label, value, isCopy = false, status, link = '' }) => {
  return (
    <div className="mt-2 flex w-full flex-wrap">
      <div className="w-7/12 items-center border-b border-r border-bgSt py-4 pl-8 font-sfpro text-lg">
        {label}
      </div>
      <div className="flex w-5/12 items-center justify-between gap-2 border-b border-bgSt py-4 pl-6 pr-4 font-handjet text-lg hover:text-highlight">
        {status !== undefined ? (
          <Image
            src={status ? icons.CheckmarkIcon : icons.RedSquareIcon}
            alt={status ? 'Positive' : 'Negative'}
            width={30}
            height={30}
          />
        ) : value ? (
          <>
            <Link href={link}>
              {cutHash({ value: value })}
            </Link>
            {isCopy && <CopyButton value={value} size="md" />}
          </>
        ) : null}
      </div>
    </div>
  );
};

export default NodeDetailsItem;
