import { getTranslations } from 'next-intl/server';
import { FC } from 'react';

import AuthzPermissionsPanel from '@/app/validators/[id]/[operatorAddress]/validator_passport/authz/node-details/authz-permissions-panel';
import CurrencyRewards from '@/app/validators/[id]/[operatorAddress]/validator_passport/authz/node-details/currency-rewards';
import NodeDetailsItem from '@/app/validators/[id]/[operatorAddress]/validator_passport/authz/node-details/node-details-item';
import SubTitle from '@/components/common/sub-title';
import TabList from '@/components/common/tabs/tab-list';
import { getPassportAuthzTabs } from '@/components/common/tabs/tabs-data';
import { NodeWithValidatorAndChain } from '@/services/node-service';
import authzService, { AuthzTabSlug } from '@/services/authz-service';
import priceService from '@/services/price-service';
import TxService from '@/services/tx-service';
import voteService from '@/services/vote-service';

interface OwnProps {
  locale: string;
  validatorId: number;
  operatorAddress: string;
  node: NodeWithValidatorAndChain | null;
  authzTab: AuthzTabSlug;
}

const normalizeAmount = (value: string | null, coinDecimals: number | null | undefined): number | null => {
  if (value === null || coinDecimals === null || coinDecimals === undefined) {
    return null;
  }

  const amount = Number(value) / 10 ** coinDecimals;
  return Number.isFinite(amount) ? amount : null;
};

const NodeDetails: FC<OwnProps> = async ({ authzTab, locale, validatorId, operatorAddress, node }) => {
  const t = await getTranslations({ locale, namespace: 'ValidatorPassportPage' });

  if (!node) {
    return null;
  }

  const nodeAuthzTabs = getPassportAuthzTabs(validatorId, operatorAddress);
  const isLive = node.chain.ecosystem === 'cosmos' && Boolean(node.accountAddress);
  const normalizedChainName = node.chain.name.toLowerCase();
  const isTxLive = normalizedChainName === 'cosmoshub' || normalizedChainName === 'atomone';
  const txAddresses = [node.accountAddress, node.operatorAddress].filter((address): address is string => !!address);
  const [grants, price, votingStatus, txsBatch] = await Promise.all([
    isLive ? authzService.getNodeAuthzGrants(node.id, authzTab) : Promise.resolve([]),
    priceService.getLatestPriceByChainName(node.chain.name),
    voteService.getNodeVotingStatus(node.id, node.chainId),
    isTxLive && txAddresses.length > 0
      ? TxService.getTxsByAddressBatch(node.chain.name, txAddresses)
      : Promise.resolve(null),
  ]);
  // Chains without indexed votes/txs keep the legacy jailed-proxy instead of a definitive negative.
  const hasVoted = votingStatus === 'unknown' ? !node.jailed : votingStatus === 'voted';
  const sendsTxs = !txsBatch || txsBatch.error ? !node.jailed : txsBatch.rows.length > 1;
  const coinDecimals = node.chain.params?.coinDecimals;
  const rewardsAmount = normalizeAmount(node.outstandingRewards, coinDecimals);
  const commissionsAmount = normalizeAmount(node.outstandingCommissions, coinDecimals);
  const denom = node.chain.params?.denom ?? '';

  return (
    <div className="mt-16">
      <SubTitle text={t('Validator Node Details')} />
      <div className="mt-7 grid grid-cols-2 gap-x-10">
        <NodeDetailsItem
          label={t('validator name')}
          value={node?.validator?.moniker}
          link={`/validators/${node.validatorId}/networks`}
          isCopy
        />
        <NodeDetailsItem
          label={t('public key')}
          value={node.consensusPubkey}
          link={`/validators/${node.validatorId}/networks`}
          isCopy
        />
        <NodeDetailsItem
          label={t('account address')}
          value={node.accountAddress ?? 'N/A'}
          link={node.accountAddress ? `/networks/${node.chain.name}/address/${node.accountAddress}/passport` : ''}
          isCopy
        />
        <NodeDetailsItem
          label={t('identity')}
          value={node.identity}
          link={`/validators/${node.validatorId}/networks`}
          isCopy
        />
        <NodeDetailsItem
          label={t('validator address')}
          value={node.chain.ecosystem === 'cosmos' ? node.operatorAddress : (node.accountAddress ?? 'N/A')}
          link={
            node.chain.ecosystem === 'cosmos'
              ? `/networks/${node.chain.name}/address/${node.operatorAddress}/passport`
              : node.accountAddress
                ? `/networks/${node.chain.name}/address/${node.accountAddress}/passport`
                : ''
          }
          isCopy
        />
        <NodeDetailsItem
          label={t('reward address')}
          value={node.rewardAddress ?? 'N/A'}
          link={node.rewardAddress ? `/networks/${node.chain.name}/address/${node.operatorAddress}/passport` : ''}
          isCopy
        />
      </div>
      <div className="mt-2 flex border-b border-bgSt">
        <div className="w-[28.5%] border-r border-bgSt py-4 pl-8 font-sfpro text-lg">{t('authz permissions')}</div>
        <div className="ml-5 w-[70%] items-center justify-center">
          <div className="my-2 w-full">
            <TabList page="ValidatorPassportPage" tabs={nodeAuthzTabs} />
            <AuthzPermissionsPanel
              chainName={node.chain.name}
              grants={grants}
              isLive={isLive}
              locale={locale}
            />
          </div>
        </div>
      </div>
      <div className="mb-6 grid grid-cols-2 gap-x-10">
        <div>
          <NodeDetailsItem label={t('jail status')} value={node.jailed ? t('jailed') : t('not jailed')} />
          <NodeDetailsItem label={t('voting')} status={hasVoted} />
          <NodeDetailsItem label={t('send tx')} status={sendsTxs} />
        </div>
        <CurrencyRewards
          commissionsAmount={commissionsAmount}
          denom={denom}
          price={price}
          rewardsAmount={rewardsAmount}
        />
      </div>
    </div>
  );
};

export default NodeDetails;
