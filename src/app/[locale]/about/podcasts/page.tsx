import Image from 'next/image';
import Link from 'next/link';

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
      <div className="my-4 flex items-center justify-center">
        <iframe
          title="Citizen Web3"
          src="https://player.fireside.fm/v2/7d8ZfYhp/latest?theme=dark"
          width="740"
          height="200"
        ></iframe>
      </div>
      <div className="my-4 border-b border-bgSt py-4 text-base">
        Subscribe
        <br />
        <br />
        Get the latest episodes of Citizen Web3 automatically using the links above, or by copying and pasting the URL
        below into your favorite podcast app:
        <div className="my-8 flex">
          <Button className="block" component="link" href="https://www.citizenweb3.com/rss">
            Citizen Web3 RSS Feed
          </Button>
        </div>
        You can also subscribe with your favorite app directly, using the buttons below:
        <div className="mt-4 flex flex-row flex-wrap space-y-2">
          <Link href="https://podcasters.amazon.com/podcasts/bbdd140b-db4a-443d-bac4-680e57d2dcd5" target="_blank">
            <Image
              src="/img/icons/podcast-apps/amazon.png"
              alt="amazon"
              width={273}
              height={72}
              className="mt-2 h-auto w-24"
            />
          </Link>
          <Link href="https://podcasts.apple.com/podcast/citizen-web3/id1510241147" target="_blank">
            <Image
              src="/img/icons/podcast-apps/apple.png"
              alt="apple"
              width={270}
              height={72}
              className="h-auto w-24"
            />
          </Link>
          <Link href="https://castbox.fm/channel/id5763464" target="_blank">
            <Image
              src="/img/icons/podcast-apps/castbox.png"
              alt="castbox"
              width={273}
              height={72}
              className="h-auto w-24"
            />
          </Link>
          <Link href="https://castro.fm/podcast/879a0b01-fbbd-4fbb-9543-67b22cdecc1e" target="_blank">
            <Image
              src="/img/icons/podcast-apps/castro.png"
              alt="castro"
              width={270}
              height={72}
              className="h-auto w-24"
            />
          </Link>
          <Link href="https://overcast.fm/itunes1510241147/" target="_blank">
            <Image
              src="/img/icons/podcast-apps/google.png"
              alt="google"
              width={273}
              height={72}
              className="h-auto w-24"
            />
          </Link>
          <Link href="https://www.iheart.com/podcast/269-citizen-web3-77348233/" target="_blank">
            <Image
              src="/img/icons/podcast-apps/iheart.png"
              alt="iheart"
              width={270}
              height={72}
              className="h-auto w-24"
            />
          </Link>
          <Link href="https://overcast.fm/itunes1510241147/" target="_blank">
            <Image
              src="/img/icons/podcast-apps/overcast.png"
              alt="overcast"
              width={273}
              height={72}
              className="h-auto w-24"
            />
          </Link>
          <Link href="https://pca.st/g9vkfbgu" target="_blank">
            <Image
              src="/img/icons/podcast-apps/pocket.png"
              alt="pocket"
              width={270}
              height={72}
              className="h-auto w-24"
            />
          </Link>
          <Link href="https://radiopublic.com/citizen-web3-GmyKQN" target="_blank">
            <Image
              src="/img/icons/podcast-apps/public.png"
              alt="public"
              width={273}
              height={72}
              className="h-auto w-24"
            />
          </Link>
          <Link href="https://open.spotify.com/show/4pwsjBsgY1C5XCyRoslbSn" target="_blank">
            <Image
              src="/img/icons/podcast-apps/spotify.png"
              alt="spotify"
              width={270}
              height={72}
              className="h-auto w-24"
            />
          </Link>
          <Link href="https://tunein.com/podcasts/Technology-Podcasts/Citizen-Web3-p1350473/" target="_blank">
            <Image
              src="/img/icons/podcast-apps/tunein.png"
              alt="tunein"
              width={273}
              height={72}
              className="h-auto w-24"
            />
          </Link>
        </div>
      </div>
    </div>
  );
}
