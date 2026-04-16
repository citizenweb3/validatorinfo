import Image from 'next/image';
import { FC } from 'react';

interface OwnProps {
  src: string;
  alt: string;
  compact?: boolean;
}

const Story: FC<OwnProps> = ({ src, alt, compact = false }) => {
  return (
    <div className="relative hidden h-[53px] md:block">
      <Image
        src={`/img/stories/${src}.png`}
        alt={alt}
        width={767}
        height={53}
        className="absolute right-[max(0px,calc(100vw-1884px))] top-0 h-[53px] w-[767px] object-cover opacity-70"
        priority
      />
    </div>
  );
};

export default Story;
