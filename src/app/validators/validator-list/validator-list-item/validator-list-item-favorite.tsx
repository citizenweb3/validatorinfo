import Image from 'next/image';
import { FC } from 'react';

import Button from '@/components/common/button';
import icons from '@/components/icons';

interface OwnProps {
  isFavorite?: boolean;
}

const ValidatorListItemFavorite: FC<OwnProps> = ({ isFavorite }) => {
  return (
    <div className="-mb-2.5 max-h-16 max-w-7">
      <Button className="relative z-20 h-16 w-7">
        {isFavorite ? (
          <Image src={icons.StarIconHighlighted} alt="Favorite" priority className="w-9 min-w-9" />
        ) : (
          <Image src={icons.StarIcon} alt="Favorite" priority className="w-6 min-w-6" />
        )}
      </Button>
    </div>
  );
};

export default ValidatorListItemFavorite;
