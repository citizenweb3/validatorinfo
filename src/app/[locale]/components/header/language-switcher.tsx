'use client';

import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { useOnClickOutside } from 'usehooks-ts';

import Button from '@/components/common/button';
import { type Locale, locales, usePathname, useRouter } from '@/i18n';

export default function LanguageSwitcher() {
  const [isOpened, setIsOpened] = useState<boolean>(false);
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('common');
  const locale = t('locale');

  const ref = useRef(null);
  useOnClickOutside(ref, () => setIsOpened(false));

  const changeLocale = (newLocale: Locale) => {
    setIsOpened(false);
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div ref={ref} className="font-sfpro relative max-h-7 text-base">
      <Button onClick={() => setIsOpened(!isOpened)} className="h-7 w-10 uppercase">
        {locale}
      </Button>
      {isOpened && (
        <div className="absolute top-7 flex-col">
          {locales
            .filter((ln) => ln !== locale)
            .map((ln) => (
              <Button key={ln} className="h-7 w-10 uppercase" onClick={() => changeLocale(ln)}>
                {ln}
              </Button>
            ))}
        </div>
      )}
    </div>
  );
}
