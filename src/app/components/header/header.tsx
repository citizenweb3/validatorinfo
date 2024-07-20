import { FC } from 'react';

import HeaderControls from '@/app/components/header/header-controls';
import HeaderSettings from '@/app/components/header/header-settings';
import Quotes from '@/app/components/header/quotes';

interface OwnProps {}

const Header: FC<OwnProps> = () => {
  return (
    <div>
      <div className="flex flex-row space-x-7 pt-1">
        <Quotes />
        <HeaderSettings />
      </div>
      <HeaderControls />
    </div>
  );
};

export default Header;
