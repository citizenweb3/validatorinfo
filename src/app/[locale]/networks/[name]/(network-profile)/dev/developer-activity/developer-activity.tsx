import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import {
  devActivityTableExampleInterface,
  networkProfileExample,
} from '@/app/networks/[name]/(network-profile)/networkProfileExample';
import SubTitle from '@/components/common/sub-title';
import TableDropdown from '@/components/common/table-dropdown';
import DeveloperActivityTable
  from '@/app/networks/[name]/(network-profile)/dev/developer-activity/developer-activity-table';
import DeveloperActivityChart
  from '@/app/networks/[name]/(network-profile)/dev/developer-activity/developer-activity-chart';

interface OwnProps {
}

const DeveloperActivity: FC<OwnProps> = async () => {
  const t = await getTranslations('NetworkDevInfo.DeveloperActivity');

  return (
    <div className="mt-14">
      <SubTitle text={t('Subtitle')} />
      <div className="flex flex-row mt-10 ml-12">
        <div className="flex flex-row items-center border-r border-bgSt pr-7">
          <div className="text-highlight font-sfpro text-lg pr-2">
            {t('star')}:
          </div>
          <div className="font-handjet text-xl">
            22
          </div>
        </div>
        <div className="flex flex-row items-center border-r border-bgSt pr-7 ml-4">
          <div className="font-sfpro text-lg pr-2">
            {t('forked')}:
          </div>
          <div className="font-handjet text-xl">
            124
          </div>
        </div>
        <div className="flex flex-row items-center border-r border-bgSt pr-7 ml-4">
          <div className="font-sfpro text-lg pr-2">
            {t('repositories')}:
          </div>
          <div className="font-handjet text-xl">
            4
          </div>
        </div>
        <div className="flex flex-row items-center ml-4">
          <div className="font-sfpro text-lg pr-2">
            {t('most active repo')}:
          </div>
          <div className="font-handjet text-xl">
            123
          </div>
        </div>
      </div>
      <div className="mx-12 mb-20">
        <DeveloperActivityChart />
      </div>
      <TableDropdown<devActivityTableExampleInterface[]>
        page="NetworkDevInfo.DeveloperActivity"
        Table={DeveloperActivityTable}
        items={networkProfileExample.developerActivityTable}
      />
    </div>
  );
};

export default DeveloperActivity;
