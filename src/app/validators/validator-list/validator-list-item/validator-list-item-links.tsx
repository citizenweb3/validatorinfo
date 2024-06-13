import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

import icons from '@/components/icons';
import { ValidatorLinks } from '@/types';

interface OwnProps {
  validatorId: number;
  links: ValidatorLinks;
}

const ValidatorListItemLinks: FC<OwnProps> = ({ validatorId, links }) => {
  const size = 'h-6 w-6 min-w-6 min-h-6';
  return (
    <div className="flex min-w-14 max-w-14 flex-wrap items-center justify-center">
      <Link
        href={`/validator/${validatorId}`}
        className={`${links.github && links.x ? 'flex basis-full items-center justify-center' : ''} ${size}`}
      >
        <Image src={icons.CW3Icon} alt="control" className={size} />
      </Link>
      {links.github && (
        <Link href={links.github} className={size} target="_blank">
          <Image src={icons.GithubIcon} alt={links.github} />
        </Link>
      )}
      {links.x && (
        <Link href={links.x} className={size} target="_blank">
          <Image src={icons.XIcon} alt={links.x} className={size} />
        </Link>
      )}
    </div>
  );
};

export default ValidatorListItemLinks;
