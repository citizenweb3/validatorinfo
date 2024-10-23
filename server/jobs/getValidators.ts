import { Prisma, PrismaClient } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';


export const getValidatorsLogos = async (client: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>) => {
  try {
    const validators = (
      await client.validator.findMany({ where: { url: null } })
    ).filter((data) => data.identity !== '');
    for (const { identity, moniker } of validators) {
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
          await client.validator.upsert({
            create: { identity: identity, url: logo, moniker: moniker },
            update: { identity: identity, url: logo },
            where: { identity: identity },
          });
        }
      } catch (e) {}
    }
  } catch (e) {
    console.log("Can't fetch data: ", e);
  }
};
