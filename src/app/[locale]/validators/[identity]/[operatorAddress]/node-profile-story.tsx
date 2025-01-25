import Image from 'next/image';
import { FC } from 'react';

import icons from '@/components/icons';

interface OwnProps {
  leftIconUrl: string | null | undefined;
  rightIconUrl: string | null | undefined;
}

const NodeProfileStory: FC<OwnProps> = ({ leftIconUrl, rightIconUrl }) => {
  const iconSizes =
    'sm:w-[40px] sm:h-[40px] md:w-[45px] md:h-[45px] lg:w-[50px] lg:h-[50px] xl:w-[60px] xl:h-[60px] 2xl:w-[63px] 2xl:h-[63px]';

  return (
    <div className="relative mx-auto my-2 w-full max-w-[3010px]">
      <Image
        src="/img/stories/validator-on-network.png"
        alt="Background"
        width={3010}
        height={208}
        className="block h-auto w-full"
      />

      <div
        className="
          absolute
          left-[35%]
          right-[35%]
          top-1/2
          -translate-y-1/2
          border-t-[3px]
          border-dashed
          border-dottedLine
        "
      />

      <div
        className="
          absolute
          left-[31%]
          top-1/2
          -translate-y-1/2
          rounded-full
          bg-background
        "
      >
        <div className={`relative ${iconSizes}`}>
          <Image src={leftIconUrl ?? icons.AvatarIcon} alt="Validator" fill className="rounded-full object-contain" />
        </div>
      </div>

      <div
        className="
          absolute
          right-[31%]
          top-1/2
          -translate-y-1/2
          rounded-full
          bg-background
        "
      >
        <div className={`relative ${iconSizes}`}>
          <Image src={rightIconUrl ?? icons.AvatarIcon} alt="Network" fill className="rounded-full object-contain" />
        </div>
      </div>
    </div>
  );
};

export default NodeProfileStory;
