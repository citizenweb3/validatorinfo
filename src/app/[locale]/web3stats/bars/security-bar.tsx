import { FC } from 'react';
import CustomBar from '@/components/customSVG/infoBar'; // Adjust the import path as needed

const SecurityBar: FC = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 text-lg">
      <div className="w-82">
        <CustomBar value={80} color="#E5C46B" />
      </div>
      <div>Security</div>
    </div>
  );
};

export default SecurityBar;