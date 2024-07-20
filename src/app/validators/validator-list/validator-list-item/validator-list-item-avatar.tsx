import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

import icons from '@/components/icons';

interface OwnProps {
  icon?: string;
  name: string;
  id: number;
}

const ValidatorListItemAvatar: FC<OwnProps> = ({ icon, name, id }) => {
  return (
    <Link href={`/validators/${id}`} className="flex flex-col items-center justify-center">
      <div className="relative h-[3.3125rem] w-[3.3125rem]">
        {icon ? (
          <Image
            src={icon}
            alt={name}
            width={40}
            height={40}
            className="absolute left-1/2 top-1/2 z-10 h-10 w-10 -translate-x-1/2 -translate-y-1/2 transform rounded-full group-hover:shadow-2xl"
          />
        ) : (
          <Image
            src={icons.AvatarIcon}
            alt={name}
            width={40}
            height={40}
            className="absolute left-1/2 top-1/2 z-10 h-10 w-10 -translate-x-1/2 -translate-y-1/2 transform rounded-full group-hover:shadow-2xl"
          />
        )}
      </div>
      <div className="text-nowrap text-center text-sm">{name}</div>
    </Link>
  );
};

export default ValidatorListItemAvatar;
