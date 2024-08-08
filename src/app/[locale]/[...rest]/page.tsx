import { unstable_setRequestLocale } from 'next-intl/server';

import NotToday from '@/components/common/not-today';
import { NextPageWithLocale } from '@/i18n';

const NotFoundPage: NextPageWithLocale = async ({ params: { locale } }) => {
  unstable_setRequestLocale(locale);

  return (
    <div className="w-full">
      <NotToday />
    </div>
  );
};

export default NotFoundPage;
