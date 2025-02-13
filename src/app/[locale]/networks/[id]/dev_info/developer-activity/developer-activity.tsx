import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import {
  devActivityTableExampleInterface,
  networkProfileExample,
} from '@/app/networks/[id]/networkProfileExample';
import MetricsCardItem from '@/components/common/metrics-cards/metrics-card-item';
import SubTitle from '@/components/common/sub-title';
import TableDropdown from '@/components/common/table-dropdown';
import DeveloperActivityTable from '@/app/networks/[id]/dev_info/developer-activity/developer-activity-table';

interface OwnProps {
}

const DeveloperActivity: FC<OwnProps> = async () => {
  const t = await getTranslations('NetworkDevInfo');

  return (
    <div className="">
      <SubTitle text={t('Developer Activity')} />
      <div className="flex w-full flex-row justify-center gap-6">
        {networkProfileExample.developerActivity.map((item) => (
          <MetricsCardItem key={item.title}
                           title={t(item.title as 'github stars')}
                           data={item.data}
                           className={'pt-2.5'}
                           dataClassName={'mt-3'}
                           isModal />
        ))}
      </div>
      <TableDropdown<devActivityTableExampleInterface[]>
        page="NetworkDevInfo"
        Table={DeveloperActivityTable}
        items={networkProfileExample.developerActivityTable}
      />
    </div>

  );
};

export default DeveloperActivity;
