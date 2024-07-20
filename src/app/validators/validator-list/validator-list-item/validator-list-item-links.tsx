import Link from 'next/link';
import { FC } from 'react';

import { ValidatorLinks } from '@/types';

interface OwnProps {
  validatorId: number;
  links: ValidatorLinks;
}

const ValidatorListItemLinks: FC<OwnProps> = ({ validatorId, links }) => {
  const size = 'h-8 w-8 min-w-8 min-h-8';
  return (
    <div className="flex items-center justify-center">
      <div className="flex items-center justify-center -space-x-1">
        <Link href={`/validator/${validatorId}`} className={`${size}`}>
          <div className={`${size} bg-cw3 hover:bg-cw3_h bg-contain bg-no-repeat`} />
        </Link>
        {links.github && (
          <Link href={links.github} className={size} target="_blank">
            <div className={`${size} bg-github hover:bg-github_h bg-contain bg-no-repeat`} />
          </Link>
        )}
        {links.x && (
          <Link href={links.x} className={size} target="_blank">
            <div className={`${size} bg-x hover:bg-x_h bg-contain bg-no-repeat`} />
          </Link>
        )}
      </div>
    </div>
  );
};

export default ValidatorListItemLinks;
