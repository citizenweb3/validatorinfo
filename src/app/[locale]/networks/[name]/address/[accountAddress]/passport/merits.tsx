import { FC } from 'react';
import Tooltip from '@/components/common/tooltip';

interface OwnProps {}

const Merits: FC<OwnProps> = async ({}) => {
  const iconsSize = 'h-24 min-h-24 w-24 min-w-24 bg-contain bg-no-repeat ml-3';

  return (
    <div>
      <div className="mt-6 flex items-center gap-10">
        <Tooltip tooltip={'text'} direction={'bottom'}>
          <div className={`${iconsSize} bg-keyhole hover:bg-keyhole_h`} />
        </Tooltip>
        <Tooltip tooltip={'text'} direction={'bottom'}>
          <div className={`${iconsSize} bg-eco hover:bg-eco_h`} />
        </Tooltip>
        <Tooltip tooltip={'text'} direction={'bottom'}>
          <div className={`${iconsSize} bg-github_g hover:bg-github_g_h`} />
        </Tooltip>
      </div>
    </div>
  );
};

export default Merits;
