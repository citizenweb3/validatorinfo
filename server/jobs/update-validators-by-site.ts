import { Validator } from '@prisma/client';
import * as cheerio from 'cheerio';

import db from '@/db';
import logger from '@/logger';

const { logInfo, logError } = logger('fetch-website-links');

const checkIsUserValid = (username: string): boolean => {
  return /^@?(\w){1,25}$/.test(username);
};

function checkAndUpdateGitHubUrl(url: string): string {
  url = normalizeUrl(url);
  try {
    const parsedUrl = new URL(url);
    const returnTo = parsedUrl.searchParams.get('return_to');
    if (returnTo) {
      return decodeURIComponent(returnTo);
    }
    return url;
  } catch (error) {
    logError(`Invalid GitHub URL provided: ${url}`);
    return '';
  }
}

const extractHandle = ($: any, domain: string): string | undefined => {
  const link = $(`a[href*="//${domain}"]`).attr('href');
  if (!link) return undefined;

  try {
    const normalizedLink = normalizeUrl(link);
    const parsedUrl = new URL(normalizedLink);
    if (!parsedUrl.hostname.includes(domain)) {
      logError(`URL does not match domain ${domain}: ${link}`);
      return undefined;
    }
    let handle = parsedUrl.pathname.replace(/^\/+/, '');
    if (handle.includes('/')) {
      handle = handle.split('/')[0];
    }
    if (checkIsUserValid(handle)) {
      return handle;
    }
    logError(`Invalid handle for ${domain}: ${link} => ${handle}`);
    return undefined;
  } catch (error) {
    logError(`Error parsing URL for ${domain}: ${link}`);
    return undefined;
  }
};

const normalizeUrl = (url: string): string => {
  if (!/^https?:\/\//i.test(url)) {
    return `http://${url}`;
  }
  return url;
};

async function checkUrl(url: string): Promise<{ twitter?: string; github?: string }> {
  url = normalizeUrl(url);
  try {
    new URL(url);
  } catch (err) {
    logError(`Invalid website URL: ${url}`);
    return {};
  }

  const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }
  const html = await response.text();
  const $ = cheerio.load(html);

  const twitterHandle = extractHandle($, 'twitter.com') || extractHandle($, 'x.com');
  const githubLink = $('a[href*="github.com"]').attr('href');

  return {
    twitter: twitterHandle ? `https://x.com/${twitterHandle}` : undefined,
    github: githubLink ? checkAndUpdateGitHubUrl(githubLink) : undefined,
  };
}

const updateValidatorsBySite = async () => {
  logInfo('Updating validators links');
  const validators: Validator[] = await db.validator.findMany({
    where: {
      website: { not: null },
      OR: [{ twitter: null }, { twitter: '' }, { github: null }, { github: '' }],
    },
  });

  let validatorsCount = validators.length;
  for (const validator of validators) {
    validatorsCount--;
    if (validator.website) {
      try {
        const { twitter, github } = await checkUrl(validator.website);

        const updateData: Partial<Validator> = {};
        if (twitter && !validator.twitter) {
          updateData.twitter = twitter;
        }
        if (github && !validator.github) {
          updateData.github = github;
        }
        if (Object.keys(updateData).length > 0) {
          await db.validator.update({ where: { id: validator.id }, data: updateData });
          logInfo(
            `${validatorsCount}/${validators.length} Updated validator ${validator.moniker} with ${JSON.stringify(updateData)}`,
          );
        } else {
          logInfo(
            `${validatorsCount}/${validators.length} No updates found for validator ${validator.moniker} - ${validator.identity}`,
          );
        }
      } catch (error) {
        logError(
          `${validatorsCount}/${validators.length} Error fetching URL ${validator.website}: ${error instanceof Error ? error.message : error}`,
        );
      }
    } else {
      logError(
        `${validatorsCount}/${validators.length} No website for validator ${validator.moniker} - ${validator.identity}`,
      );
    }
  }
};

export default updateValidatorsBySite;
