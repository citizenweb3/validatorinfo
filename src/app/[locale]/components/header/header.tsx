import { FC, Suspense } from 'react';

import HeaderControls from '@/components/header/header-controls';
import HeaderSettings from '@/components/header/header-settings';
import Quotes from '@/components/header/quotes';

interface OwnProps {}

const Header: FC<OwnProps> = async () => {
  return (
    <div>
      <div className="hidden flex-row space-x-7 pt-1 md:flex">
        <Suspense fallback={<div />}>
          <Quotes />
        </Suspense>
        <HeaderSettings />
      </div>
      <HeaderControls />
    </div>
  );
};

export default Header;
