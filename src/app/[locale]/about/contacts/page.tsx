import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import Link from 'next/link';

import PageTitle from '@/components/common/page-title';
import TabList from '@/components/common/tabs/tab-list';
import { aboutTabs } from '@/components/common/tabs/tabs-data';
import Story from '@/components/story';
import { NextPageWithLocale } from '@/i18n';
import SubDescription from '@/components/sub-description';

const ContactsPage: NextPageWithLocale = async ({ params: { locale } }) => {
  const t = await getTranslations({ locale, namespace: 'AboutPage' });
  unstable_setRequestLocale(locale);

  const size = 'h-24 w-24 min-w-24 min-h-24';
  return (
    <div>
      <Story src="contacts" alt="Pixelated, 90s game-style characters giving contact info to validatorinfo.com logo" />
      <TabList page="AboutPage" tabs={aboutTabs} />
      <PageTitle text={t('Contacts.title')} />
      <SubDescription text={t('Contacts.description')} contentClassName={'m-4'} plusClassName={'mt-2'} />
      <div>
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
            <Image src="/img/icons/email.svg" alt="email" width={32} height={32} className="mr-5 mt-2 h-9 w-9" />
            <Link href="mailto:ping@validatorinfo.com" className="text-4xl hover:text-highlight hover:underline">
              ping@validatorinfo.com
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactsPage;
