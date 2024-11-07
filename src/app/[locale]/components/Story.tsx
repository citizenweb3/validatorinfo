import Image from 'next/image';
import { FC } from 'react';

interface OwnProps {
  src: string;
}

const Story: FC<OwnProps> = ({ src }) => {
  return (
    <div className="my-2">
      <Image src={`/img/stories/${src}.png`} alt="story" width={3010} height={208} className="w-full" priority />
    </div>
  );
};

export default Story;
