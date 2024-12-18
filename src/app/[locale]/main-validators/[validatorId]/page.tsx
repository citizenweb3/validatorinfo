import NotToday from '@/components/common/not-today';
import TabList from '@/components/common/tabs/tab-list';
import { mainTabs } from '@/components/common/tabs/tabs-data';

export default function Home() {
  return (
    <div>
      <TabList page="HomePage" tabs={mainTabs} />
      <NotToday />
    </div>
  );
}
