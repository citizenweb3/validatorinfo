import Image from 'next/image';

import Button from '@/components/common/button';
import SubTitle from '@/components/common/sub-title';

export default function Podcasts() {
  return (
    <div>
      <SubTitle text="Citizen Web3 Podcast" />
      <div className="mt-4 border-b border-bgSt py-4 text-base">
        Citizen Web3 runs one of the oldest web3-focused podcasts. Our show is focused on those that contribute to
        building the web3 space.
        <br />
        <br />
        We have been on air for 4 years, and are eager to invite you to listen to the fascinating stories, collected in
        our interviews with founders, validators, VCs, researches, CTOs, and many other great people that have been
        building this space.
      </div>
      <div className="flex items-center justify-center">
        <Image src="/img/icons/tmp/podcast.png" alt="tmp" width={652} height={176} />
      </div>
      <div className="mt-4 border-b border-bgSt py-4 text-base">
        Subscribe
        <br />
        <br />
        Get the latest episodes of Citizen Web3 automatically using the links above, or by copying and pasting the URL
        below into your favorite podcast app:
        <Button className="my-8 block">Citizen Web3 RSS Feed</Button>
        You can also subscribe with your favorite app directly, using the buttons below:
        <div className="mt-4 flex flex-row flex-wrap space-y-2">
          <Image
            src="/img/icons/podcast-apps/amazon.png"
            alt="amazon"
            width={273}
            height={72}
            className="mt-2 h-auto w-24"
          />
          <Image src="/img/icons/podcast-apps/apple.png" alt="apple" width={270} height={72} className="h-auto w-24" />
          <Image
            src="/img/icons/podcast-apps/castbox.png"
            alt="castbox"
            width={273}
            height={72}
            className="h-auto w-24"
          />
          <Image
            src="/img/icons/podcast-apps/castro.png"
            alt="castro"
            width={270}
            height={72}
            className="h-auto w-24"
          />
          <Image
            src="/img/icons/podcast-apps/google.png"
            alt="google"
            width={273}
            height={72}
            className="h-auto w-24"
          />
          <Image
            src="/img/icons/podcast-apps/iheart.png"
            alt="iheart"
            width={270}
            height={72}
            className="h-auto w-24"
          />
          <Image
            src="/img/icons/podcast-apps/overcast.png"
            alt="overcast"
            width={273}
            height={72}
            className="h-auto w-24"
          />
          <Image
            src="/img/icons/podcast-apps/pocket.png"
            alt="pocket"
            width={270}
            height={72}
            className="h-auto w-24"
          />
          <Image
            src="/img/icons/podcast-apps/public.png"
            alt="public"
            width={273}
            height={72}
            className="h-auto w-24"
          />
          <Image
            src="/img/icons/podcast-apps/spotify.png"
            alt="spotify"
            width={270}
            height={72}
            className="h-auto w-24"
          />
          <Image
            src="/img/icons/podcast-apps/tunein.png"
            alt="tunein"
            width={273}
            height={72}
            className="h-auto w-24"
          />
        </div>
      </div>
    </div>
  );
}
