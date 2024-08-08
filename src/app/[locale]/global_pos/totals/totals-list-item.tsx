import { FC } from 'react';

interface OwnProps {
  title: string;
  data: string;
}

const TotalsListItem: FC<OwnProps> = ({ title, data }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="text-center text-base text-highlight">{title}</div>
      <div className="font-hackernoon mt-5 text-lg">{data}</div>
    </div>
  );
};

export default TotalsListItem;
