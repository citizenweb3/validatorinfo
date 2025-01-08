import Image from 'next/image';
import { FC } from 'react';

const ValidatorToolList: FC = () => {
  return (
    <div className="grid grid-cols-5 items-start">
      <Image src={'/img/public-good-tool.svg'} width={273} height={315} alt="tool" className="col-span-1" />
      <Image src={'/img/public-good-tool.svg'} width={273} height={315} alt="tool" className="col-span-1" />
      <Image src={'/img/public-good-tool.svg'} width={273} height={315} alt="tool" className="col-span-1" />
      <Image src={'/img/public-good-tool.svg'} width={273} height={315} alt="tool" className="col-span-1" />
      <Image src={'/img/public-good-tool.svg'} width={273} height={315} alt="tool" className="col-span-1" />
    </div>
  );
};

export default ValidatorToolList;
