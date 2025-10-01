import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

import FallbackImage from '@/components/common/image-downloader-fallback';
import { validatorNodesWithChainData } from '@/services/validator-service';

interface OwnProps {
  icons: {
    leftIconUrl: string;
    rightIconUrl: string;
  };
  node?: validatorNodesWithChainData | undefined;
}

const NodeProfileStory: FC<OwnProps> = ({ icons, node }) => {
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
          <Link href={`/validators/${node?.validatorId}/networks`}>
            <FallbackImage src={icons.leftIconUrl} alt="Validator" fill className="rounded-full object-contain" />
          </Link>
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
          <Link href={`/networks/${node?.chain.name}/overview`}>
            <FallbackImage src={icons.rightIconUrl} alt="Validator" fill className="rounded-full object-contain" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NodeProfileStory;
