import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

import Tooltip from '@/components/common/tooltip';
import icons from '@/components/icons';

interface OwnProps {
  icon: string | null;
  name: string;
  id: string;
}

const ValidatorListItemAvatar: FC<OwnProps> = ({ icon, name, id }) => {
  return (
    <Link href={`/validators/${id}`} className="flex items-center hover:text-highlight">
      <div className="relative h-[3.3125rem] w-[3.3125rem]">
        {icon ? (
          <Image
            src={icon}
            alt={name}
            width={40}
            height={40}
            className="absolute left-1/2 top-1/2 z-10 h-10 w-10 -translate-x-1/2 -translate-y-1/2 transform rounded-full group-hover/avatar:shadow-2xl"
          />
        ) : (
          <Image
            src={icons.AvatarIcon}
            alt={name}
            width={40}
            height={40}
            className="absolute left-1/2 top-1/2 z-10 h-10 w-10 -translate-x-1/2 -translate-y-1/2 transform rounded-full group-hover/avatar:shadow-2xl"
          />
        )}
      </div>
      <Tooltip tooltip={name} direction="top">
        <div className="ml-1 max-w-64 overflow-x-hidden text-ellipsis text-nowrap text-center text-base">{name}</div>
      </Tooltip>
    </Link>
  );
};

export default ValidatorListItemAvatar;
