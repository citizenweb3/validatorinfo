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

const SearchItem: FC<OwnProps> = ({ link, name, isSelected, icon, onClick, isScroll=true }) => {
  return (
    <Link
      href={link}
      onClick={onClick}
      className={`${isSelected ? 'bg-bgHover' : ''} flex cursor-pointer items-center justify-between rounded-md px-4 py-2 hover:bg-bgHover`}
      scroll={isScroll}
    >
      <FallbackImage src={icon ?? icons.AvatarIcon}
                     alt="Validator"
                     width={40}
                     height={40}
                     className="md:h-7 md:w-7 sm:h-12 sm:w-12 h-20 w-20 rounded-full my-4 sm:my-1 md:my-0" />
      <div className="ml-4 flex-grow md:text-base sm:text-2xl text-4xl">{name}</div>
    </Link>
  );
};

export default SearchItem;
