import logger from '@/logger';
import { GetNodesFunction } from '@/server/tools/chains/chain-indexer';
import { NodeResult } from '@/server/types';
import fetchChainData from '@/server/tools/get-chain-data';
import db from '@/db';
import { getValidatorStake } from '@/server/tools/chains/polkadot/utils/get-validators-stake';
import { getSelfBonded } from '@/server/tools/chains/polkadot/utils/get-self-bonded';
import { getValidatorMetadata } from '@/server/tools/chains/polkadot/utils/get-validators-metadata';
import isUrlValid from '@/server/utils/is-url-valid';

const { logError } = logger('polkadot-nodes');

interface ValidatorsList {
  validators: {
    address: string;
    status: string;
  }[];
}

interface Stakes {
  address: string;
  total: string;
  own: string;
}

const getNodes: GetNodesFunction = async (chain) => {
  const dbNodes = await db.node.findMany({ where: { chain: { name: chain.name } } });
  const dbMap = new Map(dbNodes.map(
    (node) => [node.operatorAddress, node]));

  const validators = (
    await fetchChainData<ValidatorsList>(
      chain.name,
      'rest',
      `/pallets/staking/validators`,
    )
  ).validators;

  if (!validators || !validators.length) {
    logError(`No validators found. Chain: ${chain.name}`);
    return [];
  }

  let stakes: Stakes[] = [];

  try {
    stakes = await getValidatorStake(chain) || [];
  } catch (e) {
    logError(`getValidatorStake failed with error: ${e}`);
  }

  if (!stakes.length) {
    logError(`No stakes found. Chain: ${chain.name}`);
  }

  const stakesMap = new Map<string, typeof stakes[0]>(
    stakes.map((stake) => [stake.address, stake]),
  );

  const validatorsMetadata = await getValidatorMetadata();

  const results: NodeResult[] = [];

  for (const validator of validators) {
    const dbNode = dbMap.get(validator.address);
    const stake = stakesMap.get(validator.address);

    let minSelfDelegation: string | null = '';
    let allTokens = '';

    if (stake) {
      minSelfDelegation = stake.own !== null && stake.own !== ''
        ? String(stake.own)
        : (dbNode?.minSelfDelegation ?? '');
      allTokens = stake.total !== null && stake.total !== ''
        ? String(stake.total)
        : (dbNode?.tokens ?? '');
    } else {
      let bonded: string | null = null;
      try {
        bonded = await getSelfBonded(chain, validator.address);
      } catch (e) {
        logError(`getSelfBonded failed for ${validator.address}: ${e}`);
      }
      minSelfDelegation = bonded !== null && bonded !== ''
        ? String(bonded)
        : (dbNode?.minSelfDelegation ?? '');
      allTokens = '';
    }

    const foundValidatorMetadata = validatorsMetadata.find(
      (val) => val.address === validator.address,
    );

    let website = foundValidatorMetadata?.info.web ?? '';
    if (website && website !== '' && website !== 'None') {
      website = website.startsWith('http')
        ? website
        : `https://${website}`;
      website = isUrlValid(website) ? website : '';
    } else {
      website = '';
    }

    const node: NodeResult = {
      operator_address: validator.address,
      delegator_shares: allTokens,
      consensus_pubkey: {
        '@type': '',
        key: '',
      },
      jailed: validator.status
        ? !validator.status.startsWith('active')
        : (dbNode?.jailed ?? false),
      min_self_delegation: minSelfDelegation,
      unbonding_height: dbNode?.unbondingHeight ?? '0',
      unbonding_time: dbNode?.unbondingTime?.toISOString?.() ?? new Date(0).toISOString(),
      tokens: allTokens,
      status: validator.status.startsWith('active') ? 'BOND_STATUS_BONDED' : 'BOND_STATUS_UNBONDED',
      commission: {
        commission_rates: {
          rate: dbNode?.rate ?? '0',
          max_rate: dbNode?.maxRate ?? '0',
          max_change_rate: dbNode?.maxChangeRate ?? '0',
        },
        update_time: new Date().toISOString(),
      },
      description: {
        identity: validator.address,
        moniker: foundValidatorMetadata?.info.display
        && foundValidatorMetadata.info.display !== ''
        && foundValidatorMetadata.info.display !== 'None'
          ? foundValidatorMetadata.info.display
          : (dbNode?.moniker ?? ''),
        website: website && website !== ''
          ? website
          : (dbNode?.website ?? ''),
        security_contact: foundValidatorMetadata?.info.email
        && foundValidatorMetadata.info.email !== ''
        && foundValidatorMetadata.info.email !== 'None'
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
