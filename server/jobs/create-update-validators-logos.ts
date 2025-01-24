import { sleep } from '@cosmjs/utils';
import { Validator } from '@prisma/client';

import db from '@/db';

const isIdentityValid = (identity: string): boolean => !!(identity && identity.match(/^[0-9A-Z]{16}$/));

const getLogoFromKeybase = async (identity: string) => {
  try {
    const username = (
      await fetch(`https://keybase.io/_/api/1.0/key/fetch.json?pgp_key_ids=${identity}`).then((data) => data.json())
    ).keys[0].username;

    if (username) {
      return (
        await fetch(`https://keybase.io/_/api/1.0/user/lookup.json?usernames=${username}&fields=pictures`).then(
          (data) => data.json(),
        )
      ).them[0].pictures.primary.url;
    }
  } catch (e) {}
};

const updateValidatorLogo = async (identity: string, moniker: string) => {
  const logo = await getLogoFromKeybase(identity);
  try {
    await db.validator.upsert({
      create: { identity: identity, url: logo, moniker: moniker },
      update: { identity: identity, url: logo },
      where: { identity: identity },
    });
  } catch (e) {}
};

const createUpdateValidatorsLogos = async () => {
  let validators: Validator[] = (await db.validator.findMany({ orderBy: { moniker: 'asc' } })).filter(
    (data: Validator) => isIdentityValid(data.identity),
  );

  for (const { identity, moniker, url } of validators) {
    let isNeedUpdate = false;
    try {
      if (url) {
        const res = await fetch(url);
        if (!res.ok) {
          isNeedUpdate = true;
        }
      } else {
        isNeedUpdate = true;
      }
    } catch (e) {
      isNeedUpdate = true;
    }
    if (isNeedUpdate) {
      console.log(`Updating validator logo for ${moniker} - ${identity}`);
      await updateValidatorLogo(identity, moniker);
    }
    await sleep(1000);
  }
};

export default createUpdateValidatorsLogos;
