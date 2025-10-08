import { NextPageWithLocale } from '@/i18n';
import RoundedButton from '@/components/common/rounded-button';
import { getTranslations } from 'next-intl/server';

interface PageProps {
  params: NextPageWithLocale & { name: string; proposalId: string };
}

const ProposalPage: NextPageWithLocale<PageProps> = async ({
    params: { locale, name, proposalId },
  }) => {
  const t = await getTranslations({ locale, namespace: 'ProposalPage' });

  return (
    <>
      <div className="flex justify-end">
        <RoundedButton href={`${proposalId}/votes`} className="font-handjet text-lg">
          {t('show dropdown')}
        </RoundedButton>
      </div>
    </>
  );
};

export default ProposalPage;
