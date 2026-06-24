import { redirect } from 'next/navigation';

import { NextPageWithLocale } from '@/i18n';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: { poolSlug: string };
}

// No standalone base page — like the validator profile, the default landing is the centre "networks"
// tab (in-URL). Direct hits on the base URL redirect there so the default tab always shows in the URL.
const MiningPoolProfileBasePage: NextPageWithLocale<PageProps> = ({ params: { poolSlug } }) => {
  redirect(`/mining-pools/${poolSlug}/networks`);
};

export default MiningPoolProfileBasePage;
