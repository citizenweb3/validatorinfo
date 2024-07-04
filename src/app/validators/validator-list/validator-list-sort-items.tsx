import { FC } from 'react';

interface OwnProps {}

const ValidatorListSortItems: FC<OwnProps> = ({}) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-1">
      <div className="h-1.5 w-2 rotate-180 cursor-pointer bg-[url('/img/icons/triangle.svg')] bg-contain hover:bg-[url('/img/icons/triangle-h.svg')]" />
      <div className="h-1.5 w-2 cursor-pointer bg-[url('/img/icons/triangle.svg')] bg-contain hover:bg-[url('/img/icons/triangle-h.svg')]" />
    </div>
  );
};

export default ValidatorListSortItems;
