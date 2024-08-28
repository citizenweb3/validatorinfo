import { FC } from 'react';

import Doughnut from '@/components/charts/doughnut/doughnut-chart';
import PageSubTitle from '@/components/common/page-subtitle';

const PosTvsGrow: FC = () => {
  return (
    <div>
      <PageSubTitle text="TVS Growt" />
      <div className="flex justify-center">
        <Doughnut />
      </div>
    </div>
  );
};

export default PosTvsGrow;
