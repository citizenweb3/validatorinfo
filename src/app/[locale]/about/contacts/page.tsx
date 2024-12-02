import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import Link from 'next/link';

import Story from '@/components/Story';
import PageTitle from '@/components/common/page-title';
import TabList from '@/components/common/tabs/tab-list';
import { aboutTabs } from '@/components/common/tabs/tabs-data';
import { NextPageWithLocale } from '@/i18n';

const ContactsPage: NextPageWithLocale = async ({ params: { locale } }) => {
  const t = await getTranslations({ locale, namespace: 'AboutPage' });
  unstable_setRequestLocale(locale);

  const size = 'h-24 w-24 min-w-24 min-h-24';
  return (
    <div>
      <Story src="contacts" />
      <TabList page="AboutPage" tabs={aboutTabs} />
      <PageTitle text={t('Contacts')} />
      <div className="py-4">
        <div className="mb-4 mt-12 flex justify-around">
          <Link href="https://validatorinfo.com/blog/" className={`${size}`} target="_blank">
            <div className={`${size} bg-blog bg-contain bg-no-repeat hover:bg-blog_h`} />
          </Link>
          <Link href="https://www.citizenweb3.com/about" className={`${size}`} target="_blank">
            <div className={`${size} bg-cw3 bg-contain bg-no-repeat hover:bg-cw3_h`} />
          </Link>
          <Link href="https://github.com/citizenweb3/validatorinfo" className={size} target="_blank">
            <div className={`${size} bg-github bg-contain bg-no-repeat hover:bg-github_h`} />
          </Link>
          <Link href="https://twitter.com/therealvalinfo" className={size} target="_blank">
            <div className={`${size} bg-x bg-contain bg-no-repeat hover:bg-x_h`} />
          </Link>
        </div>
        <div className="mt-12 flex justify-center">
          <div className="flex flex-row items-center">
            <Image src="/img/icons/email.svg" alt="email" width={16} height={16} className="mr-1 h-4 w-4" />
            <Link href="mailto:ping@validatorinfo.com" className="text-base hover:text-highlight hover:underline">
              ping@validatorinfo.com
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactsPage;
