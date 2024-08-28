import NotToday from '@/components/common/not-today';
import TabList from '@/components/common/tabs/tab-list';
import { validatorTabs } from '@/components/common/tabs/tabs-data';

export default function Home() {
  return (
    <div>
      <TabList page="HomePage" tabs={validatorTabs} />
      <NotToday />
    </div>
  );
}
