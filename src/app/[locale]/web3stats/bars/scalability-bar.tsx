import { FC } from 'react';
import CustomBar from '@/components/customSVG/infoBar';

const ScalabilityBar: FC = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 text-lg">
      <div className="w-82">
        <CustomBar value={50} color="#E5C46B" />
      </div>
      <div>Scalability</div>
    </div>
  );
};

export default ScalabilityBar;