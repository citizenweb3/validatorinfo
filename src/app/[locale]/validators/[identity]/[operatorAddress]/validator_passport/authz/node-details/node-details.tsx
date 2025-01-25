import { getTranslations } from 'next-intl/server';
import { FC, ReactNode } from 'react';

import CurrencyRewards from '@/app/validators/[identity]/[operatorAddress]/validator_passport/authz/node-details/currency-rewards';
import NodeDetailsItem from '@/app/validators/[identity]/[operatorAddress]/validator_passport/authz/node-details/node-details-item';
import SubTitle from '@/components/common/sub-title';
import TabList from '@/components/common/tabs/tab-list';
import { getNodeAuthzTabs } from '@/components/common/tabs/tabs-data';
import { validatorNodesWithChainData } from '@/services/validator-service';

interface OwnProps {
  locale: string;
  children: ReactNode;
  identity: string;
  operatorAddress: string;
  node?: validatorNodesWithChainData | undefined;
}

const NodeDetails: FC<OwnProps> = async ({ locale, children, identity, operatorAddress, node }) => {
  const t = await getTranslations({ locale, namespace: 'ValidatorPassportPage' });

  if (!node) {
    return null;
  }
  const nodeAuthzTabs = getNodeAuthzTabs(identity, operatorAddress);

  return (
    <div className="mt-6">
      <SubTitle text={t('Validator Node Details')} />
      <div className="mt-6 grid grid-cols-2 gap-x-10">
        <NodeDetailsItem label={t('validator name')} value={node.moniker} isCopy />
        <NodeDetailsItem label={t('public key')} value={node.consensus_pubkey} isCopy />
        <NodeDetailsItem label={t('account address')} value={node.operator_address} isCopy />
        <NodeDetailsItem label={t('identity')} value={node.identity} isCopy />
        <NodeDetailsItem label={t('validator address')} value={node.operator_address} isCopy />
        <NodeDetailsItem label={t('reward address')} value={node.operator_address} isCopy />
      </div>
      <div className="mt-2 flex border-b border-bgSt">
        <div className="w-[28.5%] border-r border-bgSt py-4 pl-8 font-sfpro text-lg">Authz Permissions</div>
        <div className="ml-5 w-[70%] items-center justify-center">
          <div className="my-2 w-full">
            <TabList page="ValidatorPassportPage" tabs={nodeAuthzTabs} />
            {children}
          </div>
        </div>
      </div>
      <div className="mb-6 grid grid-cols-2 gap-x-10">
        <div>
          <NodeDetailsItem label={t('jail status')} value={node.jailed ? 'Jail' : 'Unjail'} />
          <NodeDetailsItem label={t('voting')} isCheckmark={!node.jailed} />
          <NodeDetailsItem label={t('send tx')} isCheckmark={!node.jailed} />
        </div>
        <CurrencyRewards />
      </div>
    </div>
  );
};

export default NodeDetails;
