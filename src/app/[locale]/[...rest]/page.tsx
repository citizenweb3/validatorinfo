import { unstable_setRequestLocale } from 'next-intl/server';

import NotToday from '@/components/common/not-today';
import { NextPageWithLocale } from '@/i18n';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NotFoundPage: NextPageWithLocale = async ({ params: { locale } }) => {
  unstable_setRequestLocale(locale);

  return (
    <div className="w-full">
      <NotToday />
    </div>
  );
};

export default NotFoundPage;
