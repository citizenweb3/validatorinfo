'use client';

import { usePathname } from 'next/navigation';

import Story from '@/components/story';

type StoryEntry = { src: string; alt: string };

const storyMap: Record<string, StoryEntry> = {
  '/': { src: 'global', alt: 'ValidatorInfo homepage story' },
  '/ai': { src: 'ai', alt: 'AI assistant story' },
  '/ecosystems': {
    src: 'ecosystems',
    alt: 'Pixelated, 90s game-style characters look to the ecosystems magic portal',
  },
  '/p2pchat': { src: 'rumors', alt: 'P2P chat rumors story' },
  '/about': { src: 'about', alt: 'About ValidatorInfo story' },
  '/about/staking': {
    src: 'staking',
    alt: 'Pixelated, 90s game-style characters stake on validator and mining pool rewards',
  },
  '/about/partners': {
    src: 'partners',
    alt: 'Pixelated, 90s game-style characters partner up and exchanging consensus',
  },
  '/about/podcasts': {
    src: 'podcast',
    alt: 'Pixelated, 90s game-style characters recording the Citizen Web3 podcast together',
  },
  '/about/contacts': {
    src: 'contacts',
    alt: 'Pixelated, 90s game-style characters giving contact info to validatorinfo.com logo',
  },
  '/validators': { src: 'validators', alt: 'Validators page story' },
  '/web3stats': { src: 'global', alt: 'Web3 stats story' },
  '/networks': { src: 'networks', alt: 'Networks page story' },
  '/stakingcalculator': { src: 'calculator', alt: 'Staking calculator story' },
  '/comparevalidators': { src: 'compare', alt: 'Compare validators story' },
  '/nodes': { src: 'nodes', alt: 'Nodes page story' },
  '/mining-pools': { src: 'nodes', alt: 'Mining pools story' },
  '/metrics': { src: 'metrics', alt: 'Metrics page story' },
  '/explain': { src: 'metrics', alt: 'Explain page story' },
  '/library': {
    src: 'library',
    alt: 'Pixelated, 90s game-style characters next to five bookcases',
  },
};

const LOCALES = ['en', 'pt', 'ru'];

const stripLocale = (path: string): string => {
  for (const locale of LOCALES) {
    const prefix = `/${locale}`;
    if (path === prefix) return '/';
    if (path.startsWith(`${prefix}/`)) return path.slice(prefix.length);
  }
  return path;
};

const getStoryForPath = (path: string): StoryEntry | null => {
  if (path.startsWith('/networks/') && path.includes('/address/')) {
    return { src: 'account', alt: 'Account page story' };
  }

  if (storyMap[path]) return storyMap[path];

  if (path.startsWith('/library/')) {
    return storyMap['/library'] ?? null;
  }

  return null;
};

const StoryBanner = () => {
  const pathname = usePathname();
  const path = stripLocale(pathname);
  const story = getStoryForPath(path);

  if (!story) return null;

  return <Story src={story.src} alt={story.alt} />;
};

export default StoryBanner;
