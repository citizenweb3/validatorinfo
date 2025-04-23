'use client';

import { FC } from 'react';
import { assetsExample } from '@/app/profile/wallet/assetsExample';
import AssetsDropdown from '@/app/profile/wallet/assets-dropdown';

interface OwnProps {}

const ChooseAsset: FC<OwnProps> = ({}) => {
  return (
    <AssetsDropdown list={assetsExample} />
  );
};

export default ChooseAsset;
