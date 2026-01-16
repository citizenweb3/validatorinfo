import { FC, Suspense } from 'react';

import CoCreateButton from '@/components/header/co-create-button';
import HeaderControls from '@/components/header/header-controls';
import HeaderSettings from '@/components/header/header-settings';
import Quotes from '@/components/header/quotes';

interface OwnProps {}

const Header: FC<OwnProps> = async () => {
  return (
    <div>
      <div className="hidden flex-row items-center space-x-7 pt-1 md:flex">
        <Suspense fallback={<div />}>
          <Quotes />
        </Suspense>
        <CoCreateButton />
        <HeaderSettings />
      </div>
      <HeaderControls />
    </div>
  );
};

export default Header;
