import { FC } from 'react';

interface OwnProps {}

const InfoButton: FC<OwnProps> = ({}) => {
  return (
    <div className="flex h-4 w-4 items-center justify-center rounded-full border-2 border-bgSt pl-[0.125rem] font-retro text-xs text-bgSt">
      i
    </div>
  );
};

export default InfoButton;
