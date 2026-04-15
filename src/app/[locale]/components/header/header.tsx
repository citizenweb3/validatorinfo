import { FC } from 'react';

import CoCreateButton from '@/components/header/co-create-button';
import HeaderControls from '@/components/header/header-controls';
import HelpButton from '@/components/header/help-button';
import SettingsDropdown from '@/components/header/settings-dropdown';
import StoryBanner from '@/components/header/story-banner';

interface OwnProps {}

const Header: FC<OwnProps> = async () => {
  return (
    <div className="flex flex-col gap-2">
      <div className="relative hidden items-center pt-3 md:flex">
        <CoCreateButton />
        <div className="absolute right-0 flex items-center gap-2">
          <SettingsDropdown />
          <HelpButton />
        </div>
      </div>
      <StoryBanner />
      <HeaderControls />
    </div>
  );
};

export default Header;
