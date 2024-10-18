import { FC } from 'react';

interface OwnProps {
  letter: string;
}

const Letter: FC<OwnProps> = ({ letter }) => {
  return (
    <div className="ml-14 mt-6 flex">
      <div className="border border-highlight px-2 py-0 text-2xl text-highlight">{letter}</div>
    </div>
  );
};

export default Letter;
