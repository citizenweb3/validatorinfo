'use client';

import { useState } from 'react';

import Button from '@/components/common/button';
import BaseModal from '@/components/common/modal/base-modal';

const OurManifestoModal = () => {
  const [isToolsOpened, setIsToolsOpened] = useState<boolean>(false);
  return (
    <>
      <div className="ml-10 mt-5">
        <Button className="text-lg" onClick={() => setIsToolsOpened(true)}>
          Learn More
        </Button>
      </div>
      <BaseModal
        title="Our Manifesto"
        isRelative={false}
        opened={isToolsOpened}
        onClose={() => setIsToolsOpened(false)}
        className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform"
      >
        <div className="w-max max-w-[80vw] p-10 pt-5 text-base">
          <div className="ml-10">
            From this distant vantage point, the Earth might not seem of any particular interest. But for us, it&apos;s
            different. Consider again at that dot. That&apos;s here. That&apos;s home. That&apos;s us. On it everyone
            you love, everyone you know, everyone you ever heard of, every human being who ever was, lived out their
            lives. The aggregate of our joy and suffering, thousands of confident religions, ideologies, and economic
            doctrines, every hunter and forager, every hero and coward, every creator and destroyer of civilization,
            every king and peasant, every young couple in love, every mother and father, hopeful child, inventor and
            explorer, every teacher of morals, every corrupt politician, every &quot;superstar,&quot; every
            &quot;supreme leader,&quot; every saint and sinner in the history of our species lived there--on a mote of
            dust suspended in a sunbeam... Our posturings, our imagined self-importance, the delusion that we have some
            privileged position in the Universe, are challenged by this point of pale light. Our planet is a lonely
            speck in the great enveloping cosmic dark. In our obscurity, in all this vastness, there is no hint that
            help will come from elsewhere to save us from ourselves...
            <br />
            <br />
            From &apos;A Pale Blue Dot&apos;, by Carl Sagan.
          </div>
          <div className="mt-8">
            We believe in freedom above needs. We believe in possibilities above enforcement. We believe in values above
            desires. We believe that censorship has killed more people than anything else together combined. We value
            honesty and we value the truth. We value love and cherish all existing creatures. We value intelligence and
            we value decentralization.
            <br />
            <br />
            We believe in communication, which allows participants to think, make their mind up and cast personal votes
            on any topic and subject. We think that content should strive to lack subjective opinions and help its
            consumers to form an opinion, which will result in better discussion, and in turn in a more efficient
            consensus.
            <br />
            <br />
            We believe that blockchains are not simply a form of digital nations. But, open and verifiable blockchains
            are somewhat similar to natural hives, forests, patterns in the nature that allow us to communicate better.
            Without communication, we are doomed, and decentralized consensus is a tool that can and will help those who
            desire to make our pale blue dot a slightly better place.
            <br />
            <br />
            AND MAY THE CODE BE WITH YOU!
          </div>
        </div>
      </BaseModal>
    </>
  );
};

export default OurManifestoModal;
