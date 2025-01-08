import { Prisma, PrismaClient } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';

import { ChainWithNodes, Validator } from '../types';

const getData = async (lcd: string, path: string) => await fetch(lcd + path).then((data) => data.json());

const getCosmosNodes = async (
  client: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
  chain: ChainWithNodes,
) => {
  console.log(chain.name);
  const validators: Validator[] = (
    await getData(
      chain.lcdNodes[0].url,
      '/cosmos/staking/v1beta1/validators?pagination.limit=1000&pagination.count_total=false',
    )
  ).validators;
  validators.map(
    async ({
      commission,
      consensus_pubkey,
      delegator_shares,
      description,
      jailed,
      min_self_delegation,
      operator_address,
      tokens,
      unbonding_height,
      unbonding_time,
    }) => {
      const identity = await client.validator.findUnique({ where: { identity: description.identity } });
      if (!identity) {
        try {
          await client.validator.create({
            data: {
              identity: description.identity,
              moniker: description.moniker,
              details: description.details,
              website: description.website,
              security_contact: description.security_contact,
            },
          });
        } catch (err) {
          console.log(err);
        }
      }
      await client.node.upsert({
        where: { operator_address: operator_address },
        update: {
          tokens: tokens,
          moniker: description.moniker,
          delegator_shares: delegator_shares,
          details: description.details,
          website: description.website,
          security_contact: description.security_contact,
          jailed: jailed,
          rate: commission.commission_rates.rate,
          update_time: commission.update_time,
        },
        create: {
          chainId: chain.chainId,
          moniker: description.moniker,
          operator_address: operator_address,
          consensus_pubkey: consensus_pubkey.key,
          delegator_shares: delegator_shares,
          details: description.details,
          identity: description.identity,
          website: description.website,
          security_contact: description.security_contact,
          jailed: jailed,
          min_self_delegation: min_self_delegation,
          max_rate: commission.commission_rates.max_rate,
          max_change_rate: commission.commission_rates.max_change_rate,
          rate: commission.commission_rates.rate,
          update_time: commission.update_time,
          tokens: tokens,
          unbonding_height: unbonding_height,
          unbonding_time: unbonding_time,
        },
      });
    },
  );
};

export default getCosmosNodes;
