import db from '@/db';

import { ChainWithNodes } from '../types';

interface NamadaNode {
  address: string;
  votingPower: string;
  maxCommission: string;
  commission: string;
  state: 'consensus' | 'inactive' | 'belowThreshold' | 'jailed';
  name: string;
  email: string;
  website: string;
  description: string;
  discordHandle: string;
  avatar: string;
  validatorId: string;
  rank: number;
}

const getData = async (url: string): Promise<NamadaNode[] | undefined> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    return response.json();
  } catch (error: any) {
    console.error('URL: ', error.message, error);
  }
};

const getNamadaNodes = async (chain: ChainWithNodes) => {
  console.log('chainName:', chain.name);

  const path = chain.grpcNodes[0].url + '/api/v1/pos/validator/all';
  const validators = await getData(path);

  if (!validators) return;

  for (const node of validators) {
    if (!node.name) continue;

    let validator = await db.validator.findFirst({
      where: { OR: [{ security_contact: node.email }, { website: node.website }, { moniker: node.name }] },
    });

    if (!validator) {
      validator = await db.validator.create({
        data: {
          identity: node.name,
          moniker: node.name,
          details: node.description,
          website: node.website,
          security_contact: node.email,
          url: node.avatar,
        },
      });
    }

    await db.node.upsert({
      where: { operator_address: node.address },
      update: {
        tokens: node.votingPower,
        moniker: node.name,
        delegator_shares: node.votingPower,
        details: node.description ?? '',
        website: node.website ?? '',
        security_contact: node.email,
        jailed: node.state === 'inactive' || node.state === 'jailed',
        rate: node.commission,
        update_time: new Date().toISOString(),
      },
      create: {
        moniker: node.name,
        operator_address: node.address,
        consensus_pubkey: '',
        delegator_shares: node.votingPower,
        details: node.description ?? '',
        website: node.website ?? '',
        security_contact: node.email,
        jailed: node.state === 'inactive' || node.state === 'jailed',
        min_self_delegation: '0',
        max_rate: node.maxCommission,
        max_change_rate: '100',
        rate: node.commission,
        update_time: new Date().toISOString(),
        tokens: node.votingPower,
        unbonding_height: '0',
        unbonding_time: new Date(0).toISOString(),
        chain: { connect: { chainId: chain.chainId } },
        validator: { connect: { identity: validator.identity } },
      },
    });
  }
};

export default getNamadaNodes;
