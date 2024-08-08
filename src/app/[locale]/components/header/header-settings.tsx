import { FC } from 'react';

import Button from '@/components/common/button';
import ThemeSwitcher from '@/components/header/theme-switcher';

import LanguageSwitcher from './language-switcher';

interface OwnProps {}

const HeaderSettings: FC<OwnProps> = async () => {
  return (
    <div className="flex flex-row items-center space-x-1">
      <ThemeSwitcher />
      <LanguageSwitcher />
      <Button className="h-7 text-base">
        <div className="-my-1.5">USD</div>
      </Button>
    </div>
  );
};

export default HeaderSettings;
