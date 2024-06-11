import { FC } from 'react';

interface OwnProps {}

const ValidatorListSortItems: FC<OwnProps> = ({}) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-1">
      <div className="h-1.5 w-2 rotate-180 cursor-pointer bg-[url('/img/icons/triangle.svg')] bg-contain hover:bg-[url('/img/icons/triangle-h.svg')]" />
      <div className="h-1.5 w-2 cursor-pointer bg-[url('/img/icons/triangle.svg')] bg-contain hover:bg-[url('/img/icons/triangle-h.svg')]" />
      <div className="h-3 w-[0.6875rem] cursor-pointer bg-[url('/img/icons/question.svg')] bg-contain bg-no-repeat hover:bg-[url('/img/icons/question-h.svg')]" />
    </div>
  );
};

export default ValidatorListSortItems;
