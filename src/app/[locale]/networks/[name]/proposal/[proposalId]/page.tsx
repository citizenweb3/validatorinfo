import { NextPageWithLocale } from '@/i18n';

interface PageProps {
  params: NextPageWithLocale & { name: string; proposalId: string };
}

const ProposalPage: NextPageWithLocale<PageProps> = async () => {
  return null;
};

export default ProposalPage;
