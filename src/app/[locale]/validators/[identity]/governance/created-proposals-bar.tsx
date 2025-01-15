import Image from 'next/image';
import { FC } from 'react';

const ValidatorCreatedProposalsBar: FC = () => {
  return (
    <Image src={'/img/charts/created-proposals-bar.svg'} width={1100} height={250} alt="proposals created" />
  );
};

export default ValidatorCreatedProposalsBar;