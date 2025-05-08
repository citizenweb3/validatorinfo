import { FC } from 'react';
import CustomBar from '@/components/customSVG/infoBar';

const DecentralizationBar: FC = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 text-lg">
      <div className="w-82">
        <CustomBar value={20} color="#E5C46B" />
      </div>
      <div>Decentralization</div>
    </div>
  );
};

export default DecentralizationBar;