import { unstable_setRequestLocale } from 'next-intl/server';

import NotToday from '@/components/common/not-today';
import { NextPageWithLocale } from '@/i18n';

const LibraryPage: NextPageWithLocale = async ({ params: { locale } }) => {
  unstable_setRequestLocale(locale);
  return <NotToday />;
};

export default LibraryPage;
