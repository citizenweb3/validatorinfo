import { FC } from 'react';

import CurrencySwitcher from '@/components/header/currency-switcher';
import ThemeSwitcher from '@/components/header/theme-switcher';

import LanguageSwitcher from './language-switcher';

interface OwnProps {}

const HeaderSettings: FC<OwnProps> = async () => {
  return (
    <div className="flex flex-row items-center space-x-1">
      <ThemeSwitcher />
      <LanguageSwitcher />
      <CurrencySwitcher />
    </div>
  );
};

export default HeaderSettings;
