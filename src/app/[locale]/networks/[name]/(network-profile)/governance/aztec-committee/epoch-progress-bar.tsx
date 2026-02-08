import { FC } from 'react';

interface EpochProgressBarProps {
  progress: number;
  currentEpoch: number;
  slotsIntoEpoch: number;
  epochDuration: number;
  slotsRemaining: number;
}

const EpochProgressBar: FC<EpochProgressBarProps> = ({
  progress,
  currentEpoch,
  slotsIntoEpoch,
  epochDuration,
  slotsRemaining,
}) => {
  return (
    <div className="w-[80%] my-20">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-sfpro text-lg">Epoch Progress</span>
        <span className="font-handjet text-xl text-highlight">Epoch {currentEpoch}</span>
      </div>

      <div className="relative h-6 w-full overflow-hidden rounded-sm bg-table_row">
        <div
          className="h-full rounded-sm transition-all duration-500"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #E5C46B 0%, #4FB848 100%)',
          }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between font-handjet text-lg">
        <span className="text-lg">
          {slotsIntoEpoch} / {epochDuration} slots
        </span>
        <span className="text-highlight text-lg">{progress.toFixed(1)}%</span>
        <span className="text-lg">{slotsRemaining} remaining</span>
      </div>
    </div>
  );
};

export default EpochProgressBar;
