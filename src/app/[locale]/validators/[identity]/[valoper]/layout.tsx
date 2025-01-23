import { unstable_setRequestLocale } from 'next-intl/server';
import { ReactNode } from 'react';

import TabList from '@/components/common/tabs/tab-list';
import { getNodeProfileTabs } from '@/components/common/tabs/tabs-data';
import { Locale } from '@/i18n';
import Story from '@/components/Story';
import NodeProfileStory from '@/app/validators/[identity]/[valoper]/NodeProfileStory';
import ValidatorService from '@/services/validator-service';

export default async function NodeProfileLayout({
  children,
  params: { locale, identity, valoper },
}: Readonly<{
  children: ReactNode;
  params: { locale: Locale; identity: string; valoper: string };
}>) {
  unstable_setRequestLocale(locale);
  const nodeProfileTabs = getNodeProfileTabs(identity, valoper);
  const nodeData = await ValidatorService.getValidatorNodesWithChains(identity);
  const node = nodeData.validatorNodesWithChainData.find(
    (item) => item.operator_address === valoper
  );
  const validator = await ValidatorService.getValidatorByIdentity(identity);

  return (
    <div>
      <NodeProfileStory leftIconUrl={validator?.url} rightIconUrl={node?.logoUrl} />
      <TabList page="NodeProfileHeader" tabs={nodeProfileTabs} />
      {children}
    </div>
  );
}
