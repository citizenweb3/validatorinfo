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
  isScroll?: boolean;
}

const SearchItem: FC<OwnProps> = ({ link, name, isSelected, icon, onClick, isScroll = true }) => {
  return (
    <Link
      href={link}
      onClick={onClick}
      className={`${isSelected ? 'bg-bgHover' : ''} flex cursor-pointer items-center justify-between rounded-md px-3 py-2 hover:bg-bgHover md:px-4 md:py-2`}
      scroll={isScroll}
    >
      <FallbackImage
        src={icon ?? icons.AvatarIcon}
        alt="Validator"
        width={40}
        height={40}
        className="my-1 h-8 w-8 rounded-full object-contain md:my-0 md:h-7 md:w-7"
      />
      <div className="ml-3 flex-grow text-base md:ml-4">{name}</div>
    </Link>
  );
};

export default SearchItem;
