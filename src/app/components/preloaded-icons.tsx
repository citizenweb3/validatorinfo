import Head from 'next/head';

import icons from '@/components/icons';

const PreloadedIcons = () => {
  return (
    <Head>
      {Object.values(icons).map((icon) => (
        <link key={icon.src} rel="preload" href={icon.src} as="image" />
      ))}
    </Head>
  );
};

export default PreloadedIcons;
