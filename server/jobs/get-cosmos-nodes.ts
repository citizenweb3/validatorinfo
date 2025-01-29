import db from '@/db';

import { ChainWithNodes, Validator } from '../types';

const getData = async (url: string) => await fetch(url).then((data) => data.json());

const getCosmosNodes = async (chain: ChainWithNodes) => {
  const validatorsUrl = `${chain.lcdNodes[0].url}/cosmos/staking/v1beta1/validators?pagination.limit=10000&pagination.count_total=false`;

  try {
    console.log(`Get validators for ${chain.name}`);
    const validators: Validator[] = (await getData(validatorsUrl)).validators;
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
        // if (!description.identity || description.identity.length !== 16) {
        //   description.identity = operator_address.slice(0, 24);
        // }
        const identity = await db.validator.findUnique({ where: { identity: description.identity } });
        if (!identity) {
          try {
            await db.validator.create({
              data: {
                identity: description.identity,
                moniker: description.moniker,
                details: description.details,
                website: description.website,
                security_contact: description.security_contact,
              },
            });
          } catch (err) {
            console.log(description.identity, err);
          }
        }
        await db.node.upsert({
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
    console.log("Can't fetch cosmos nodes: ", validatorsUrl, e);
  }
};

export default getCosmosNodes;
