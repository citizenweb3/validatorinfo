import Link from 'next/link';
import { FC } from 'react';

import { ValidatorLinks } from '@/types';

interface OwnProps {
  id: string;
  links?: ValidatorLinks;
}

const ValidatorListItemLinks: FC<OwnProps> = ({ id, links }) => {
  const size = 'h-12 w-12 min-w-12 min-h-12';
  return (
    <div className="flex items-center justify-center">
      <div className="flex items-center justify-center -space-x-3">
        <Link href={`/validator/${id}`} className={`${size}`}>
          <div className={`${size} bg-cw3 bg-contain bg-no-repeat hover:bg-cw3_h`} />
        </Link>
        {links?.github && (
          <Link href={links.github} className={size} target="_blank">
            <div className={`${size} bg-github bg-contain bg-no-repeat hover:bg-github_h`} />
          </Link>
        )}
        {links?.x && (
          <Link href={links.x} className={size} target="_blank">
            <div className={`${size} bg-x bg-contain bg-no-repeat hover:bg-x_h`} />
          </Link>
        )}
      </div>
    </div>
  );
};

export default ValidatorListItemLinks;
