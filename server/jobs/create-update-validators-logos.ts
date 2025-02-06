import { sleep } from '@cosmjs/utils';
import { Validator } from '@prisma/client';

import db from '@/db';
import logger from '@/logger';

const { logInfo, logError, logDebug } = logger('keychain');

const isIdentityValid = (identity: string): boolean => !!(identity && identity.match(/^[0-9A-Z]{16}$/));

const getLogoFromKeybase = async (identity: string): Promise<string | undefined> => {
  logDebug(`Getting logo for ${identity}`);
  try {
    const usernameUrl = `https://keybase.io/_/api/1.0/key/fetch.json?pgp_key_ids=${identity}`;
    logDebug(`Getting username for ${identity}, ${usernameUrl}`);
    const resp = await fetch(usernameUrl).then((data) => data.json());

    if (resp.status.code === 901) {
      logDebug(`No username for ${identity}`);
      return;
    }

    const username = resp.keys[0].username;

    if (username) {
      const logoUrl = `https://keybase.io/_/api/1.0/user/lookup.json?usernames=${username}&fields=pictures`;
      logDebug(`Getting logo for ${username}, ${logoUrl}`);
      return (await fetch(logoUrl).then((data) => data.json())).them[0].pictures.primary.url;
    }
  } catch (e) {}
};

const updateValidatorLogo = async (identity: string, moniker: string) => {
  logDebug(`Updating validator logo for ${moniker} - ${identity}`);
  const logo = await getLogoFromKeybase(identity);
  logDebug(`Logo for ${moniker} - ${identity}: ${logo}`);
  try {
    await db.validator.upsert({
      create: { identity: identity, url: logo, moniker: moniker, wrongKey: !logo },
      update: { identity: identity, url: logo, wrongKey: !logo },
      where: { identity: identity },
    });
  } catch (e) {}
};

const createUpdateValidatorsLogos = async () => {
  logDebug('Updating validators logos');
  let validators: Validator[] = (
    await db.validator.findMany({ where: { wrongKey: { not: true } }, orderBy: { moniker: 'asc' } })
  ).filter((data: Validator) => isIdentityValid(data.identity));

  for (const { identity, moniker, url } of validators) {
    let isNeedUpdate = false;
    try {
      if (url) {
        const res = await fetch(url);
        if (!res.ok) {
          logDebug(`Existing validator logo for ${moniker} - ${identity} is not available need update`);
          isNeedUpdate = true;
        }
      } else {
        logDebug(`Validator logo for ${moniker} - ${identity} is not exists need update`);
        isNeedUpdate = true;
      }
    } catch (e) {
      logDebug(`Error checking validator logo for ${moniker} - ${identity} need update`);
      isNeedUpdate = true;
    }
    if (isNeedUpdate) {
      logInfo(`Updating validator logo for ${moniker} - ${identity}`);
      await updateValidatorLogo(identity, moniker);
    }
    await sleep(1000);
  }
};

export default createUpdateValidatorsLogos;
