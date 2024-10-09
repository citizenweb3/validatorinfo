import { Prisma, PrismaClient } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';

import { ChainWithNodes, Validator } from '../types';

const getData = async (lcd: string, path: string) => await fetch(lcd + path).then((data) => data.json());

export const getValidators = async (
  client: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
  chains: ChainWithNodes[],
) => {
  chains.map(async (chain) => {
    try {
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
          const identity = await client.validatorLogo.findUnique({ where: { identity: description.identity } });
          if (!identity) {
            await client.validatorLogo.upsert({
              where: { identity: description.identity },
              update: { identity: description.identity }, // Оставляем пустым, так как не нужно обновлять существующую запись
              create: { identity: description.identity }, // Создаем запись, если её нет
            });
          }
          await client.validator.upsert({
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
    } catch (e) {
      console.log(chain.name + 'error:', e);
    }
  });
};
