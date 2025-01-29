import Image from 'next/image';
import { FC } from 'react';

const CommunitiesList: FC = () => {
  const toolList = [
    { key: 1, link: '/img/tmp/community-bvc.png' },
    { key: 2, link: '/img/tmp/community-web3-society.png' },
  ];
  return (
    <div className="mt-12 grid grid-cols-4 items-center gap-3">
      {toolList.map((tool) => (
        <Image key={tool.key} src={tool.link} width={370} height={140} alt="tool" className="col-span-1" />
      ))}
    </div>
  );
};

export default CommunitiesList;
