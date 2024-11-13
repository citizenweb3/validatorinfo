import Link from 'next/link';
import { FC } from 'react';

import LineChart from '@/components/charts/line-chart';

interface OwnProps {
  id: string;
  activeId: string | null;
  setActiveId: (id: string | null) => void;
}

const ValidatorListItemTVS: FC<OwnProps> = ({ id, activeId, setActiveId }) => {
  const handleHover = (id: string, isHovered: boolean) => {
    if (isHovered) {
      setActiveId(id);
    } else if (activeId === id) {
      setActiveId(null);
    }
  };

  const chartData = Array.from({ length: 20 }, (_, i) => ({ x: i, y: +(Math.random() * 100).toFixed(0) }));

  return (
    <Link href={`/validators/${id}/metrics`} className="relative flex items-center justify-center text-sm">
      <div className="">
        <LineChart
          data={chartData}
          width={320}
          height={64}
          startColor="#414141"
          endColor="#52B550"
          shadowColor="rgba(0, 0, 0, 0.3)"
          className="h-16 w-80"
        />
      </div>
    </Link>
  );
};

export default ValidatorListItemTVS;
