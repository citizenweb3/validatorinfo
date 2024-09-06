import { FC } from 'react';

import Doughnut from '../../../components/charts/doughnut/doughnut-chart';

const PosTvsGrow: FC = () => {
  return (
    <div>
      <div className="flex justify-center">
        <Doughnut />
      </div>
    </div>
  );
};

export default PosTvsGrow;
