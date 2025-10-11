import { FC, ReactNode } from 'react';

interface OwnProps {
  prefix?: ReactNode;
  suffix?: ReactNode;
  text: string | ReactNode;
  className?: string;
}

const PageTitle: FC<OwnProps> = ({ prefix, suffix, text }) => {
  return (
    <h1 className="mt-4 flex w-fit border-b border-bgSt px-4 font-handjet text-4xl text-highlight">
      <span className="mr-3">{prefix}</span>
      {text}
      <span className="ml-2">{suffix}</span>
    </h1>
  );
};

export default PageTitle;
