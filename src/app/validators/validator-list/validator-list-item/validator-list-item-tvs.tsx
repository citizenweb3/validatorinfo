import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

import Line from '@/components/charts/line/line-chart';

interface OwnProps {
  id: number;
}

const ValidatorListItemTVS: FC<OwnProps> = ({ id }) => {
  return (
    <Link
      href={`/validators/${id}/metrics`}
      className="width-[178px] height-[49px] relative flex items-center justify-center text-sm"
    >
      <Line />
    </Link>
  );
};

export default ValidatorListItemTVS;
