'use client';

import { useState } from 'react';

import Button from '@/components/common/button';
import BaseModal from '@/components/common/modal/base-modal';

const ListNumber = ({ number, text }: { number: number; text: string }) => (
  <li className="list-none text-base">
    <span className="font-retro text-highlight">{number}) </span>
    <span className="text-justify">{text}</span>
  </li>
);

const OurToolsModal = () => {
  const [isToolsOpened, setIsToolsOpened] = useState<boolean>(false);
  return (
    <>
      <div className="ml-10 mt-5">
        <Button className="text-lg" onClick={() => setIsToolsOpened(true)}>
          Learn More
        </Button>
      </div>
      <BaseModal
        title="Our Tools"
        isRelative={false}
        opened={isToolsOpened}
        onClose={() => setIsToolsOpened(false)}
        className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform"
      >
        <div className="w-max max-w-[80vw] p-10 pt-5">
          <ListNumber
            number={1}
            text="Web3-focused podcast, dedicated to the stories of the people that make dreams reality"
          />
          <ListNumber
            number={2}
            text="validatorinfo.com: a dashboard and an explorer that helps you to discover validators across the web3 galaxy (in the making) "
          />
          <ListNumber
            number={3}
            text="Web3 Society: a community that helps, learns and resents tribalism. Including various incentoves (NA at
        the moment)"
          />
          <ListNumber
            number={4}
            text="Public infrastructure, including validator nodes, public RPC endpoints, various testnets. We are
        currently migrating to bare metal"
          />
          <ListNumber number={5} text="(NA at the moment) Bazaar: NFTs (old collection), Merchandise, Decentraland" />
        </div>
      </BaseModal>
    </>
  );
};

export default OurToolsModal;
