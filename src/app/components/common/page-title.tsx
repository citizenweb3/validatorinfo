import { FC } from 'react';

interface OwnProps {
  text: string;
}

const PageTitle: FC<OwnProps> = ({ text }) => {
  return <h1 className="flex w-fit border-b border-bgSt px-4 text-2xl text-highlight">{text}</h1>;
};

export default PageTitle;
