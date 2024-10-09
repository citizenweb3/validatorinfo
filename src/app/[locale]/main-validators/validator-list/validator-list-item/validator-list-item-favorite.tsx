import { FC } from 'react';

import Button from '@/components/common/button';

interface OwnProps {
  isFavorite?: boolean;
}

const ValidatorListItemFavorite: FC<OwnProps> = ({ isFavorite }) => {
  return (
    <div className="-mb-2.5 max-h-16 max-w-7">
      <Button className="relative z-20 h-16 w-7">
        <div className={`${isFavorite ? 'bg-star_h' : 'bg-star'} min-h-8 min-w-8 bg-contain`} />
      </Button>
    </div>
  );
};

export default ValidatorListItemFavorite;
