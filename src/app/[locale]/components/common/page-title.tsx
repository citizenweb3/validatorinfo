import { FC } from 'react';

interface OwnProps {
  prefix?: string;
  text: string;
}

const PageTitle: FC<OwnProps> = ({ prefix, text }) => {
  return (
    <h1 className="mt-4 flex w-fit border-b border-bgSt px-4 font-handjet text-4xl text-highlight">
      <span className="mr-3 text-white">{prefix}</span>
      {text}
    </h1>
  );
};

export default PageTitle;
