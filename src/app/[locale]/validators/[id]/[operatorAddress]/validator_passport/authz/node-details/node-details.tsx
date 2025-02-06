import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import AuthzPermissionsDetails from '@/app/validators/[id]/[operatorAddress]/validator_passport/authz/node-details/authz-permissions-details';
import CurrencyRewards from '@/app/validators/[id]/[operatorAddress]/validator_passport/authz/node-details/currency-rewards';
import NodeDetailsItem from '@/app/validators/[id]/[operatorAddress]/validator_passport/authz/node-details/node-details-item';
import { permissions } from '@/app/validators/[id]/[operatorAddress]/validator_passport/authz/node-details/permissionsExample';
import SubTitle from '@/components/common/sub-title';
import TabList from '@/components/common/tabs/tab-list';
import { getPassportAuthzTabs } from '@/components/common/tabs/tabs-data';
import { validatorNodesWithChainData } from '@/services/validator-service';

interface OwnProps {
  locale: string;
  validatorId: number;
  operatorAddress: string;
  node?: validatorNodesWithChainData | undefined;
}

const NodeDetails: FC<OwnProps> = async ({ locale, validatorId, operatorAddress, node }) => {
  const t = await getTranslations({ locale, namespace: 'ValidatorPassportPage' });

  if (!node) {
    return null;
  }

  const nodeAuthzTabs = getPassportAuthzTabs(validatorId, operatorAddress);

  return (
    <div className="mt-16">
      <SubTitle text={t('Validator Node Details')} />
      <div className="mt-7 grid grid-cols-2 gap-x-10">
        <NodeDetailsItem label={t('validator name')} value={node.moniker} isCopy />
        <NodeDetailsItem label={t('public key')} value={node.consensusPubkey} isCopy />
        <NodeDetailsItem label={t('account address')} value={node.operatorAddress} isCopy />
        <NodeDetailsItem label={t('identity')} value={node.identity} isCopy />
        <NodeDetailsItem label={t('validator address')} value={node.operatorAddress} isCopy />
        <NodeDetailsItem label={t('reward address')} value={node.operatorAddress} isCopy />
      </div>
      <div className="mt-2 flex border-b border-bgSt">
        <div className="w-[28.5%] border-r border-bgSt py-4 pl-8 font-sfpro text-lg">{t('authz permissions')}</div>
        <div className="ml-5 w-[70%] items-center justify-center">
          <div className="my-2 w-full">
            <TabList page="ValidatorPassportPage" tabs={nodeAuthzTabs} />
            <AuthzPermissionsDetails permissions={permissions} />
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
