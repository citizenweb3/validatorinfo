import logger from '@/logger';
import { GetNodesFunction } from '@/server/tools/chains/chain-indexer';
import { NodeResult } from '@/server/types';
import fetchChainData from '@/server/tools/get-chain-data';
import db from '@/db';
import { getValidatorStake } from '@/server/tools/chains/polkadot/utils/get-validators-stake';
import { getSelfBonded } from '@/server/tools/chains/polkadot/utils/get-self-bonded';

const { logError, logInfo } = logger('polkadot-nodes');

interface ValidatorsList {
  validators: {
    address: string;
    status: string;
  }[];
}

const getNodes: GetNodesFunction = async (chain) => {
  const dbNodes = await db.node.findMany({ where: { chain: { name: chain.name } } });
  const dbMap = new Map(dbNodes.map((node) => [node.operatorAddress, node]));

  const validators = (
    await fetchChainData<ValidatorsList>(
      chain.name,
      'rest',
      `/pallets/staking/storage/validators`,
    )
  ).validators;

  if (!validators || !validators.length) {
    logError(`No validators found. Chain: ${chain.name}`);
    return [];
  }

  logInfo(`Fetched validators: ${JSON.stringify(validators)}`);

  const stakes = await getValidatorStake(chain) || [];

  logInfo(`Fetched stakes: ${JSON.stringify(stakes)}`);

  if (!stakes.length) {
    logError(`No stakes found. Chain: ${chain.name}`);
  }

  const stakesMap = new Map<string, typeof stakes[0]>(
    stakes.map((stake) => [stake.address, stake]),
  );

  const results: NodeResult[] = [];

  for (const validator of validators) {
    logInfo(`Processing validator: ${validator.address}`);
    const dbNode = dbMap.get(validator.address);
    const stake = stakesMap.get(validator.address);

    let minSelfDelegation: string | null = '';
    let tokens = '';

    if (stake) {
      minSelfDelegation = stake.own != null ? String(stake.own) : '';
      tokens = stake.total != null ? String(stake.total) : '';
    } else {
      minSelfDelegation = await getSelfBonded(chain, validator.address);
      tokens = '';
    }

    const node: NodeResult = {
      operator_address: validator.address,
      delegator_shares: dbNode?.delegatorShares ?? '',
      consensus_pubkey: { '@type': '', key: dbNode?.consensusPubkey ?? '' },
      jailed: validator.status.startsWith('active') ? false : (dbNode?.jailed ?? false),
      min_self_delegation: minSelfDelegation && minSelfDelegation !== ''
        ? minSelfDelegation
        : (dbNode?.minSelfDelegation ?? ''),
      unbonding_height: dbNode?.unbondingHeight ?? '0',
      unbonding_time: dbNode?.unbondingTime?.toISOString?.() ?? new Date(0).toISOString(),
      tokens: tokens && tokens !== '' ? tokens : (dbNode?.tokens ?? ''),
      status: validator.status.startsWith('active') ? 'BOND_STATUS_BONDED' : 'BOND_STATUS_UNBONDED',
      commission: {
        commission_rates: {
          rate: dbNode?.rate ?? '0',
          max_rate: dbNode?.maxRate ?? '0',
          max_change_rate: dbNode?.maxChangeRate ?? '0',
        },
        update_time: dbNode?.updateTime?.toISOString?.() ?? new Date().toISOString(),
      },
      description: {
        identity: dbNode?.identity ?? '',
        moniker: dbNode?.moniker ?? '',
        website: dbNode?.website ?? '',
        security_contact: dbNode?.securityContact ?? '',
        details: dbNode?.details ?? '',
      },
    };

    results.push(node);
  }

  return results;
};

export default getNodes;

