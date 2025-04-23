import NotToday from '@/components/common/not-today';
import { NextPageWithLocale } from '@/i18n';

interface PageProps {}

const ProfileRewardsPage: NextPageWithLocale<PageProps> = async () => {
  return <NotToday />;
};

export default ProfileRewardsPage;
