import db from '@/db';
import logger from '@/logger';
import { GetNodesFunction } from '@/server/tools/chains/chain-indexer';
import { connectWsApi } from '@/server/tools/chains/polkadot/utils/connect-ws-api';
import { getValidatorMetadata } from '@/server/tools/chains/polkadot/utils/get-validators-metadata';
import { getValidatorStake } from '@/server/tools/chains/polkadot/utils/get-validators-stake';
import { NodeResult } from '@/server/types';
import isUrlValid from '@/server/utils/is-url-valid';

const { logError} = logger('polkadot-nodes');

const getNodes: GetNodesFunction = async (chain) => {
  const dbNodes = await db.node.findMany({ where: { chain: { name: chain.name } } });
  const dbMap = new Map(dbNodes.map((node) => [node.operatorAddress, node]));

  const wsList = chain.nodes.filter((n: any) => n.type === 'ws').map((n: any) => n.url);
  if (!wsList.length) {
    logError(`No WebSocket URLs configured for chain '${chain.name}'`);
    return [];
  }

  const api = await connectWsApi(wsList, 3);

  let activeValidatorsSet: Set<string> = new Set();
  const validatorPrefsMap = new Map<string, string>();
  let stakeMap = new Map<string, { total: string; own: string }>();

  try {
    const prefsEntries = await api.query.staking.validators.entries();
    for (const [key, prefs] of prefsEntries) {
      const address = key.args[0].toString();
      const preferences = prefs.toJSON() as any;
      const commission = preferences?.commission?.toString() || '0';
      validatorPrefsMap.set(address, commission);
    }

    const stakes = (await getValidatorStake(chain, api)) || [];

    for (const stake of stakes) {
      stakeMap.set(stake.address, { total: stake.total, own: stake.own });
      activeValidatorsSet.add(stake.address);
    }
  } catch (e) {
    logError(`Failed to fetch validator data: ${e}`);
    return [];
  } finally {
    await api.disconnect();
  }

  const validatorsMetadata = await getValidatorMetadata();

  const validators = Array.from(validatorPrefsMap.entries()).map(([address, commission]) => {
    const isActive = activeValidatorsSet.has(address);
    const stake = stakeMap.get(address) || { total: '0', own: '0' };

    return {
      address,
      isActive,
      commission,
      total: stake.total,
      own: stake.own,
    };
  });

  const results: NodeResult[] = [];

  for (const validator of validators) {
    const dbNode = dbMap.get(validator.address);

    const minSelfDelegation =
      validator.own !== null && validator.own !== '' ? String(validator.own) : (dbNode?.minSelfDelegation ?? '0');
    const allTokens =
      validator.total !== null && validator.total !== '' ? String(validator.total) : (dbNode?.tokens ?? '0');

    const foundValidatorMetadata = validatorsMetadata.find((val) => val.address === validator.address);

    let website = foundValidatorMetadata?.info.web ?? '';
    if (website && website !== '' && website !== 'None') {
      website = website.startsWith('http') ? website : `https://${website}`;
      website = isUrlValid(website) ? website : '';
    } else {
      website = '';
    }

    const commissionRate = validator.commission
      ? (BigInt(validator.commission) / BigInt(1_000_000_000)).toString()
      : (dbNode?.rate ?? '0');

    const node: NodeResult = {
      operator_address: validator.address,
      delegator_shares: allTokens,
      consensus_pubkey: {
        '@type': '',
        key: '',
      },
      jailed: !validator.isActive,
      min_self_delegation: minSelfDelegation,
      unbonding_height: dbNode?.unbondingHeight ?? '0',
      unbonding_time: dbNode?.unbondingTime?.toISOString?.() ?? new Date(0).toISOString(),
      tokens: allTokens,
      status: validator.isActive ? 'BOND_STATUS_BONDED' : 'BOND_STATUS_UNBONDED',
      commission: {
        commission_rates: {
          rate: commissionRate,
          max_rate: dbNode?.maxRate ?? '0',
          max_change_rate: dbNode?.maxChangeRate ?? '0',
        },
        update_time: new Date().toISOString(),
      },
      description: {
        identity: validator.address,
        moniker:
          foundValidatorMetadata?.info.display &&
          foundValidatorMetadata.info.display !== '' &&
          foundValidatorMetadata.info.display !== 'None'
            ? foundValidatorMetadata.info.display
            : (dbNode?.moniker ?? ''),
        website: website && website !== '' ? website : (dbNode?.website ?? ''),
        security_contact:
          foundValidatorMetadata?.info.email &&
          foundValidatorMetadata.info.email !== '' &&
          foundValidatorMetadata.info.email !== 'None'
            ? foundValidatorMetadata.info.email
            : (dbNode?.securityContact ?? ''),
        details: dbNode?.details ?? '',
      },
    };

    results.push(node);
  }
  return results;
};

export default getNodes;
