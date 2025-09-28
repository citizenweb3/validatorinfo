import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

import Tooltip from '@/components/common/tooltip';
import icons from '@/components/icons';

interface OwnProps {
  icon: string | null;
  name: string;
  href: string;
  textClassName?: string;
}

const TableAvatar: FC<OwnProps> = ({ icon, name, href, textClassName = '' }) => {
  return (
    <Link href={href} className="flex flex-row items-center hover:text-highlight my-4 md:mb-0">
      <div className="relative md:h-[3.3125rem] md:w-[3.3125rem] h-72 w-72">
        {icon ? (
          <Image
            src={icon}
            alt={name}
            width={40}
            height={40}
            className="absolute left-1/2 top-1/2 z-10 md:h-10 md:w-10 h-44 w-44 sm:h-24 sm:w-24 -translate-x-1/2 -translate-y-1/2 transform rounded-full group-hover/avatar:shadow-2xl object-contain"
          />
        ) : (
          <Image
            src={icons.AvatarIcon}
            alt={name}
            width={40}
            height={40}
            className="absolute left-1/2 top-1/2 z-10 md:h-11 md:w-11 h-44 w-44 sm:h-24 sm:w-24 -translate-x-1/2 -translate-y-1/2 transform rounded-full group-hover/avatar:shadow-2xl"
          />
        )}
      </div>
      <Tooltip tooltip={name} direction="top" className="hidden md:block">
        <div className={`${textClassName} ml-1 pr-px break-all whitespace-normal overflow-x-clip text-ellipsis md:text-nowrap text-center md:text-base sm:text-4xl text-6xl`}>
          {name}
        </div>
      </Tooltip>
    </Link>
  );
};

export default TableAvatar;
