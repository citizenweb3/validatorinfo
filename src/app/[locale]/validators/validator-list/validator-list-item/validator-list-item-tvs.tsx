import Link from 'next/link';
import { FC } from 'react';

import { lineMainTable } from '../../../../components/charts/line/configs';
import Line from '../../../../components/charts/line/line-chart';

interface OwnProps {
  id: number;
  activeId: number | null;
  setActiveId: (id: number | null) => void;
}

const ValidatorListItemTVS: FC<OwnProps> = ({ id, activeId, setActiveId }) => {
  const handleHover = (id: number, isHovered: boolean) => {
    if (isHovered) {
      setActiveId(id);
    } else if (activeId === id) {
      setActiveId(null);
    }
  };

  return (
    <Link href={`/validators/${id}/metrics`} className="relative flex items-center justify-center text-sm">
      <div className="h-[49px] w-[179px]">
        <Line config={lineMainTable} id={id} isActive={activeId === id} onHover={handleHover} />
      </div>
    </Link>
  );
};

export default ValidatorListItemTVS;
