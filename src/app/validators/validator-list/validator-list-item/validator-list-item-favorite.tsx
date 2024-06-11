import Image from 'next/image';
import { FC } from 'react';

import icons from '@/components/icons';

interface OwnProps {
  isFavorite?: boolean;
}

const ValidatorListItemFavorite: FC<OwnProps> = ({ isFavorite }) => {
  return (
    <div className="flex items-center justify-center">
      {isFavorite ? (
        <Image src={icons.StarIconHighlighted} alt="Favorite" className="w-12 min-w-12" />
      ) : (
        <Image src={icons.StarIcon} alt="Favorite" className="w-7 min-w-7" />
      )}
    </div>
  );
};

export default ValidatorListItemFavorite;
