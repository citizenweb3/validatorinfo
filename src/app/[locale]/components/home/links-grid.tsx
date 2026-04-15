import { getTranslations } from 'next-intl/server';

import HomeLinkButton from '@/components/home/home-link-button';

type HomeLinkLogoKey = 'validatorinfo' | 'citizenweb3' | 'github';

interface HomeLinkItem {
  key: 'forum' | 'staking' | 'funnyBot' | 'tokenSwap' | 'web3Login' | 'podcast' | 'github' | 'aiIntegration';
  href: string;
  logo: HomeLinkLogoKey;
  external?: boolean;
  isWalletLogin?: boolean;
}

const homeLinkLogos: Record<HomeLinkLogoKey, { src: string; className: string }> = {
  validatorinfo: {
    src: '/img/logo.svg',
    className: 'h-14 w-14 sm:h-10 sm:w-10 md:h-6 md:w-6',
  },
  citizenweb3: {
    src: '/img/icons/cw3.png',
    className: 'h-20 w-20 sm:h-14 sm:w-14 md:h-10 md:w-10',
  },
  github: {
    src: '/img/icons/github.png',
    className: 'h-20 w-20 sm:h-14 sm:w-14 md:h-10 md:w-10',
  },
};

const homeLinks: HomeLinkItem[] = [
  {
    key: 'forum',
    href: 'https://forum.validatorinfo.com',
    logo: 'validatorinfo',
    external: true,
  },
  {
    key: 'staking',
    href: 'https://staking.citizenweb3.com',
    logo: 'citizenweb3',
    external: true,
  },
  {
    key: 'funnyBot',
    href: 'https://funny.validatorinfo.com',
    logo: 'validatorinfo',
    external: true,
  },
  {
    key: 'tokenSwap',
    href: '/profile/wallet',
    logo: 'validatorinfo',
  },
  { key: 'web3Login', href: '/profile', logo: 'validatorinfo', isWalletLogin: true },
  {
    key: 'podcast',
    href: 'https://podcast.staking.citizenweb3.com',
    logo: 'citizenweb3',
    external: true,
  },
  {
    key: 'github',
    href: 'https://github.com/citizenweb3',
    logo: 'github',
    external: true,
  },
  {
    key: 'aiIntegration',
    href: 'https://agents.citizenweb3.com',
    logo: 'citizenweb3',
    external: true,
  },
];

const LinksGrid = async () => {
  const t = await getTranslations('HomePage.links');

  return (
    <section className="grid min-w-0 grid-cols-2 gap-2 md:grid-cols-4 2xl:grid-cols-8 2xl:gap-3">
      {homeLinks.map(({ key, href, logo, external, isWalletLogin }) => {
        const label = t(key);

        return (
          <HomeLinkButton
            key={key}
            href={href}
            icon={homeLinkLogos[logo]}
            external={external}
            isWalletLogin={isWalletLogin}
            label={label}
          />
        );
      })}
    </section>
  );
};

export default LinksGrid;
