import { NextPage } from 'next';
import { unstable_setRequestLocale } from 'next-intl/server';

import NotToday from '@/components/common/not-today';

const NotFoundPage: NextPage = async () => {
  unstable_setRequestLocale('en');

  return (
    <div className="w-full">
      <NotToday />
    </div>
  );
};

NotFoundPage.getInitialProps = ({ res }) => {
  if (res) {
    res.statusCode = 404; // Set HTTP status code to 404
  }
  return {};
};

export default NotFoundPage;
