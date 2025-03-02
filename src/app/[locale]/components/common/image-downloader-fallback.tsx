'use client';

import { FC, useState } from 'react';
import Image, { ImageProps } from 'next/image';
import icons from '@/components/icons';

interface OwnProps extends ImageProps {
  src: string;
  alt: string;
}

const FallbackImage: FC<OwnProps> = ({ src, alt, ...props }) => {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <Image
      src={imgSrc}
      alt={alt}
      {...props}
      onError={() => {
        if (imgSrc !== icons.AvatarIcon) {
          setImgSrc(icons.AvatarIcon);
        }
      }}
    />
  );
};

export default FallbackImage;

