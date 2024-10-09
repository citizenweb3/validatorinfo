import { FC } from 'react';

interface OwnProps {
  prefix?: string;
  text: string;
}

const PageSubTitle: FC<OwnProps> = ({ prefix, text }) => {
  return (
    <h1 className="my-3 flex w-fit border-b border-bgSt px-4 py-3 text-xl text-highlight">
      <span className="mr-3 text-white">{prefix}</span>
      {text}
    </h1>
  );
};

export default PageSubTitle;
