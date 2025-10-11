import { getTranslations } from 'next-intl/server';
import PageTitle from '@/components/common/page-title';
import { Locale, NextPageWithLocale } from '@/i18n';
import SubDescription from '@/components/sub-description';
import PassportInformation from '@/app/networks/[name]/address/[accountAddress]/passport/passport-information';
import Merits from '@/app/networks/[name]/address/[accountAddress]/passport/merits';
import Delegations from '@/app/networks/[name]/address/[accountAddress]/passport/delegations-table/delegations';
import SubTitle from '@/components/common/sub-title';
import chainService from '@/services/chain-service';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: NextPageWithLocale & { name: string, accountAddress: string };
}

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }) {
  const t = await getTranslations({ locale, namespace: 'AccountPage.Passport' });

  return {
    title: t('title'),
  };
}

const AccountPassportPage: NextPageWithLocale<PageProps> = async ({ params: { name, accountAddress, locale }, }) => {
  const t = await getTranslations({ locale, namespace: 'AccountPage.Passport' });
  const chain = await chainService.getByName(name);
  const cursor = 'h-7 min-h-7 w-7 min-w-7 bg-contain bg-no-repeat bg-cursor group-hover:bg-cursor_h group-active:bg-cursor_a';


  return (
    <div className="mb-24">
      <PageTitle
        text={t('title')}
        prefix={
          <Link href={`/networks/${chain?.name}/overview/`} className="text-highlight hover:underline group flex">
            {chain?.prettyName}
            <div className={cursor} />
          </Link>
        }
      />
      <SubDescription text={t('description')} contentClassName={'m-4'} plusClassName={'mt-2'} />
      <PassportInformation accountAddress={accountAddress} />
      <div className="my-12">
        <SubTitle text={t('Merits')} />
        <Merits />
      </div>
      <SubTitle text={t('Delegations')} />
      <Delegations chainName={name} page={'AccountPage.Passport'} />
    </div>
  );
};

export default AccountPassportPage;
