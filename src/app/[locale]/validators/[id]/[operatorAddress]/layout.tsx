import { unstable_setRequestLocale } from 'next-intl/server';
import { ReactNode } from 'react';

import NodeProfileStory from '@/app/validators/[id]/[operatorAddress]/node-profile-story';
import TabList from '@/components/common/tabs/tab-list';
import { getNodeProfileTabs } from '@/components/common/tabs/tabs-data';
import { Locale } from '@/i18n';
import validatorService from '@/services/validator-service';

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
  const nodeData = await validatorService.getValidatorNodesWithChains(validatorId);
  const node = nodeData.validatorNodesWithChainData.find((item) => item.operatorAddress === operatorAddress);
  const validator = await validatorService.getById(validatorId);

  return (
    <div>
      <NodeProfileStory leftIconUrl={validator?.url} rightIconUrl={node?.logoUrl} />
      <TabList page="NodeProfileHeader" tabs={nodeProfileTabs} />
      {children}
    </div>
  );
}
