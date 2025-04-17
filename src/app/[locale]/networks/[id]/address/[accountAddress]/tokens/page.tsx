import NotToday from '@/components/common/not-today';
import { NextPageWithLocale } from '@/i18n';

interface PageProps {}

const AccountTokensPage: NextPageWithLocale<PageProps> = async () => {
  return <NotToday />;
};

export default AccountTokensPage;
