import { sleep } from '@cosmjs/utils';
import { Validator } from '@prisma/client';

import db from '@/db';
import logger from '@/logger';
import isUrlValid from '@/server/utils/is-url-valid';

const { logInfo, logError, logDebug } = logger('keychain');

const isIdentityValid = (identity: string): boolean => !!(identity && identity.match(/^[0-9A-Z]{16}$/));

interface KeybaseInfo {
  picture: string;
  twitter: string;
  github: string;
}

const getKeybaseUsername = async (identity: string): Promise<string> => {
  const usernameUrl = `https://keybase.io/_/api/1.0/key/fetch.json?pgp_key_ids=${identity}`;
  logDebug(`Getting username for ${identity}, ${usernameUrl}`);
  const resp = await fetch(usernameUrl).then((data) => data.json());

  if (resp.status.code === 901) {
    logDebug(`No username for ${identity}`);
    return '';
  }

  return resp.keys[0].username;
};

const getInfoFromKeybase = async (username: string): Promise<KeybaseInfo> => {
  logDebug(`Getting info for ${username}`);
  let result: KeybaseInfo = {
    picture: '',
    twitter: '',
    github: '',
  };
  try {
    const infoUrl = `https://keybase.io/_/api/1.0/user/lookup.json?usernames=${username}`;
    logDebug(`Getting logo for ${username}, ${infoUrl}`);
    const info = await fetch(infoUrl).then((data) => data.json());

    result.picture = info.them[0].pictures?.primary?.url ?? '';
    result.twitter = info.them[0].proofs_summary?.by_presentation_group?.twitter?.[0]?.nametag ?? '';
    result.github = info.them[0].proofs_summary?.by_presentation_group?.github?.[0]?.nametag ?? '';

    return result;
  } catch (e) {
    logError(`Error getting info for ${username}: ${e}`);
  }
  return result;
};

const updateValidatorLogo = async (validator: Validator) => {
  logDebug(`Updating validator logo for ${validator.moniker} - ${validator.identity}`);
  let keybaseName: string | null = validator.keybaseName;
  if (!keybaseName) {
    keybaseName = await getKeybaseUsername(validator.identity);
    await db.validator.update({
      where: { id: validator.id },
      data: { keybaseName, wrongKey: !keybaseName },
    });
  }

  if (keybaseName) {
    const info = await getInfoFromKeybase(keybaseName);
    logDebug(`Info for ${keybaseName} - ${validator.identity}: ${JSON.stringify(info)}`);

    let twitter = info.twitter;
    if (twitter) {
      twitter = twitter.indexOf('http') !== 0 ? `https://x.com/${twitter}` : twitter;
      twitter = isUrlValid(twitter) ? twitter : '';
    }

    let github = info.github;
    if (github) {
      github = github.indexOf('http') !== 0 ? `https://github.com/${info.github}` : github;
      github = isUrlValid(github) ? github : '';
    }

    try {
      await db.validator.update({
        where: { id: validator.id },
        data: {
          url: info.picture,
          twitter: twitter || validator.twitter,
          github: github || validator.github,
        },
      });
    } catch (e) {
      logDebug(`Error updating validator info for ${validator.moniker} - ${validator.identity}: ${e}`);
    }
  }
};

const updateValidatorsByKeybase = async () => {
  logInfo('Updating validators logos');
  let validators: Validator[] = (
    await db.validator.findMany({ where: { wrongKey: { not: true } }, orderBy: { moniker: 'asc' } })
  ).filter((data: Validator) => isIdentityValid(data.identity));

  for (const validator of validators) {
    await updateValidatorLogo(validator);
    await sleep(100);
  }
};

export default updateValidatorsByKeybase;
