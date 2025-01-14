import Image from 'next/image';
import { FC } from 'react';

const ValidatorToolList: FC = () => {
  const toolList = [
    {key: 1, link: '/img/tmp/public-good-tool.svg'},
    {key: 2, link: '/img/tmp/public-good-tool.svg'},
    {key: 3, link: '/img/tmp/public-good-tool.svg'},
    {key: 4, link: '/img/tmp/public-good-tool.svg'},
    {key: 5, link: '/img/tmp/public-good-tool.svg'},
  ]
  return (
    <div className="mt-3 grid grid-cols-5 gap-9">
      {toolList.map((tool) => (
        <Image key={tool.key} src={tool.link} width={273} height={315} alt="tool" className="col-span-1" />
      ))}
    </div>
  );
};

export default ValidatorToolList;
