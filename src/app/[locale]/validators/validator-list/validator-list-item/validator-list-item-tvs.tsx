import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

interface OwnProps {
  id: number;
}

const ValidatorListItemTVS: FC<OwnProps> = ({ id }) => {
  return (
    <Link href={`/validators/${id}/metrics`} className="relative flex items-center justify-center text-sm">
      <Image
        src={'/img/icons/tmp/tvs-chart.svg'}
        alt="chart"
        width={178}
        height={49}
        className="max-h-12 min-w-12 group-hover/tvs:hidden"
      />
      <Image
        src={'/img/icons/tmp/tvs-chart-h.svg'}
        alt="chart"
        width={178}
        height={49}
        className="hidden max-h-12 min-w-12 group-hover/tvs:block"
      />
    </Link>
  );
};

export default ValidatorListItemTVS;
