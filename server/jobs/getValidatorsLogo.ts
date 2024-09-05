import { Prisma, PrismaClient } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';

import { ChainWithNodes } from '../types';

export const getValidatorLogos = async (client: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>) => {
  try {
    const validatorsIdentity = await (
      await client.validatorLogo.findMany({ where: { url: null } })
    ).filter((data) => data.identity !== '');
    validatorsIdentity.forEach(async ({ identity }) => {
      try {
        const keybaseUser = (
          await fetch(`https://keybase.io/_/api/1.0/key/fetch.json?pgp_key_ids=${identity}`).then((data) => data.json())
        ).keys[0].username;

        if (keybaseUser) {
          const logo = (
            await fetch(`https://keybase.io/_/api/1.0/user/lookup.json?usernames=${keybaseUser}&fields=pictures`).then(
              (data) => data.json(),
            )
          ).them[0].pictures.primary.url;
          await client.validatorLogo.upsert({
            create: { identity: identity, url: logo },
            update: { identity: identity, url: logo },
            where: { identity: identity },
          });
        }
      } catch (e) {}
    });
  } catch (e) {
    console.log("Can't fetch prices: ", e);
  }
};
