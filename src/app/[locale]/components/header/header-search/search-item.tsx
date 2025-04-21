import Link from 'next/link';
import { FC } from 'react';
import FallbackImage from '@/components/common/image-downloader-fallback';
import icons from '@/components/icons';

interface OwnProps {
  name: string;
  link: string;
  icon?: string;
  isSelected: boolean;
  onClick: () => void;
}

const SearchItem: FC<OwnProps> = ({ link, name, isSelected, icon, onClick }) => {
  return (
    <Link
      href={link}
      onClick={onClick}
      className={`${isSelected ? 'bg-bgHover' : ''} flex cursor-pointer items-center justify-between rounded-md px-4 py-2 hover:bg-bgHover`}
    >
      <FallbackImage src={icon ?? icons.AvatarIcon}
                     alt="Validator"
                     width={40}
                     height={40}
                     className="h-7 w-7 rounded-full" />
      <div className="ml-4 flex-grow">{name}</div>
    </Link>
  );
};

export default SearchItem;
