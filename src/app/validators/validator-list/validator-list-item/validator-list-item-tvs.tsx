import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

interface OwnProps {
  id: number;
}

const ValidatorListItemTVS: FC<OwnProps> = ({ id }) => {
  return (
    <Link href={`/validators/${id}/metrics`} className="relative flex items-center justify-center text-sm">
      <Image src={'/img/icons/tmp/tvs-chart.svg'} alt="chart" width={178} height={49} className="max-h-16 min-w-16" />
    </Link>
  );
};

export default ValidatorListItemTVS;
