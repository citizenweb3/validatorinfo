import Image from 'next/image';
import { FC } from 'react';

interface OwnProps {
  icon?: string;
  name: string;
}

const ValidatorListItemAvatar: FC<OwnProps> = ({ icon, name }) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="h-11 w-11 rounded-full bg-white">
        {icon && (
          <Image
            src={icon}
            alt={name}
            width={44}
            height={44}
            className="h-11 w-11 rounded-full"
          />
        )}
      </div>
      <div className="text-nowrap text-center text-base">{name}</div>
    </div>
  );
};

export default ValidatorListItemAvatar;
