import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import ProfileBanner, { DEFAULT_PODCAST_PLAYER } from '@/components/common/profile-banner';
import icons from '@/components/icons';
import db from '@/db';
import { safeHref } from '@/utils/safe-href';

interface OwnProps {
  slug: string;
  locale: string;
}

// Thin data wrapper around the shared ProfileBanner (no podcast — a pool has none). The validator
// profile uses the same banner; only the data source and the optional podcast differ.
const MiningPoolProfile: FC<OwnProps> = async ({ slug, locale }) => {
  const t = await getTranslations({ locale, namespace: 'MiningPoolProfileHeader' });

  const pool = await db.miningPool.findFirst({
    where: { slug },
    include: { chain: true },
  });
  if (!pool) return null;
  // Mirror the pages' gate (they notFound unverified pools) so the header stays blank above a 404.
  if (!pool.isVerified) return null;

  const poolLogo = pool.logoUrl || icons.AvatarIcon;
  const chainPretty = pool.chain.prettyName ?? pool.chain.name;
  const chains = [{ name: pool.chain.name, logoUrl: pool.chain.logoUrl || icons.AvatarIcon, prettyName: chainPretty }];

  return (
    <ProfileBanner
      locale={locale}
      story={t('story', { name: pool.name, chain: chainPretty })}
      centerLogo={poolLogo}
      chains={chains}
      github={safeHref(pool.github)}
      podcast={{ playerUrl: DEFAULT_PODCAST_PLAYER, summary: null, showInterviewCta: true }}
    />
  );
};

export default MiningPoolProfile;
