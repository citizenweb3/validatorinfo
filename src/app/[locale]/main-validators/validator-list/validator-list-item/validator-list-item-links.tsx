import Link from 'next/link';
import { FC } from 'react';

import { ValidatorLinks } from '@/types';

interface OwnProps {
  id: string;
  links?: ValidatorLinks;
}

const ValidatorListItemLinks: FC<OwnProps> = ({ links }) => {
  const size = 'h-12 w-12 min-w-12 min-h-12';
  return (
    <div className="flex items-center justify-center">
      <div className="flex items-center justify-center -space-x-3">
        <Link href={links?.website ?? ''} className={`${size}`}>
          <div className={`${size} bg-web hover:bg-web_h bg-contain bg-no-repeat`} />
        </Link>
        <Link href={links?.github ?? ''} className={size} target="_blank">
          <div className={`${size} bg-github bg-contain bg-no-repeat hover:bg-github_h`} />
        </Link>
        <Link href={links?.x ?? ''} className={size} target="_blank">
          <div className={`${size} bg-x bg-contain bg-no-repeat hover:bg-x_h`} />
        </Link>
      </div>
    </div>
  );
};

export default ValidatorListItemLinks;
