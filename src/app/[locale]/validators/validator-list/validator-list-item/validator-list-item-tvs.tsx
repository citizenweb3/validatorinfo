import Link from 'next/link';
import { FC } from 'react';

import Line from '../../../../components/charts/line/line-chart';

interface OwnProps {
  id: number;
}

const ValidatorListItemTVS: FC<OwnProps> = ({ id }) => {
  return (
    <Link href={`/validators/${id}/metrics`} className="flexitems-center relative justify-center text-sm">
      <div className="h-[49px] w-[179px]">
        <Line />
      </div>
    </Link>
  );
};

export default ValidatorListItemTVS;
