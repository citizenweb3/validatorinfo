import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { ReactNode } from 'react';

import NodePagesTitle from '@/app/validators/[id]/[operatorAddress]/node-pages-title';
import NodeProfileStory from '@/app/validators/[id]/[operatorAddress]/node-profile-story';
import CollapsePageHeader from '@/components/common/collapse-page-header';
import ProfileLayoutWrapper from '@/components/common/page-header-visibility-wrapper';
import TabList from '@/components/common/tabs/tab-list';
import { getNodeProfileTabs } from '@/components/common/tabs/tabs-data';
import icons from '@/components/icons';
import { Locale } from '@/i18n';
import validatorService from '@/services/validator-service';
import nodeService from '@/services/node-service';

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }) {
  const t = await getTranslations({ locale, namespace: 'ValidatorPassportPage' });

  return {
    title: t('title'),
  };
}

export default async function NodeProfileLayout({
  children,
  params: { locale, id, operatorAddress },
}: Readonly<{
  children: ReactNode;
  params: { locale: Locale; id: string; operatorAddress: string };
}>) {
  unstable_setRequestLocale(locale);
  const validatorId = parseInt(id);
  const nodeProfileTabs = getNodeProfileTabs(validatorId, operatorAddress);
  const node = await nodeService.getNodeByAddressAndId(operatorAddress, validatorId);

  const leftIconUrl = node?.validator?.url ?? icons.AvatarIcon;
  const rightIconUrl = node?.chain.logoUrl ?? icons.AvatarIcon;

  return (
    <div>
      <ProfileLayoutWrapper>
        <CollapsePageHeader>
          <NodeProfileStory icons={{ leftIconUrl, rightIconUrl }} node={node} />
        </CollapsePageHeader>
        <TabList page="NodeProfileHeader" tabs={nodeProfileTabs} />
      </ProfileLayoutWrapper>
      <NodePagesTitle page={'ValidatorPassportPage'} locale={locale} node={node} />
      {children}
    </div>
  );
}
