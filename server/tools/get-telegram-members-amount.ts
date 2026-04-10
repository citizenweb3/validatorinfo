import logger from '@/logger';

const { logError } = logger('get-telegram-members-amount');

const getUsernameFromUrl = (url: string): string => {
  const match = url.match(/t\.me\/([^/?]+)/);
  if (!match) throw new Error(`Invalid Telegram URL: ${url}`);
  return match[1];
};

const parseMembersCount = (html: string): number => {
  // Try og:description meta tag first: "N members, N online"
  const ogMatch = html.match(/<meta\s+property="og:description"\s+content="([^"]*?)"/);
  if (ogMatch) {
    const membersMatch = ogMatch[1].match(/(\d[\d\s]*)\s*(?:members|subscribers)/);
    if (membersMatch) {
      const parsed = parseInt(membersMatch[1].replace(/\s/g, ''), 10);
      if (!isNaN(parsed)) return parsed;
    }
  }

  // Fallback: look for "N members" or "N subscribers" pattern in the page content
  const textMatch = html.match(/(\d[\d\s]*)\s*(?:members|subscribers)/i);
  if (textMatch) {
    const parsed = parseInt(textMatch[1].replace(/\s/g, ''), 10);
    if (!isNaN(parsed)) return parsed;
  }

  throw new Error('Could not parse members count from Telegram page');
};

export const getTelegramMembersAmount = async (url: string, attempts = 3): Promise<number> => {
  const username = getUsernameFromUrl(url);
  try {
    const res = await fetch(`https://t.me/${username}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ValidatorInfo/1.0)',
      },
    });

    if ((res.status === 429 || res.status === 420) && attempts > 1) {
      const retryAfter = parseInt(res.headers.get('retry-after') ?? '60');
      logError(`Rate limited, sleeping for ${retryAfter}s, attempts left: ${attempts - 1}`);
      await new Promise((r) => setTimeout(r, retryAfter * 1000));
      return getTelegramMembersAmount(url, attempts - 1);
    }

    if (!res.ok) throw new Error(`Telegram page fetch failed: ${res.status}`);

    const html = await res.text();
    return parseMembersCount(html);
  } catch (e) {
    if (attempts > 1) {
      logError(`Error occurred, retrying (${attempts - 1} attempts left)`);
      return getTelegramMembersAmount(url, attempts - 1);
    }
    throw e;
  }
};
