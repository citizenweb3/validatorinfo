import NotToday from '@/components/common/not-today';
import { NextPageWithLocale } from '@/i18n';

interface PageProps {}

const AccountGovernancePage: NextPageWithLocale<PageProps> = async () => {
  return <NotToday />;
};

export default AccountGovernancePage;
