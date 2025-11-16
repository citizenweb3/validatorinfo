import logger from '@/logger';

const { logError } = logger('get-twitter-followers-amount');

const API_KEY = process.env.X_API_KEY!;
const API_SECRET = process.env.X_API_SECRET!;
let bearerToken = '';

const getBearerToken = async () => {
  const body = new URLSearchParams({ grant_type: 'client_credentials' }).toString();
  const auth = Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64');
  const res = await fetch('https://api.twitter.com/oauth2/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body,
  });
  if (!res.ok) throw new Error(`Bearer fetch failed: ${res.status}`);
  const data = await res.json();
  bearerToken = data.access_token;
};

const getUsernameFromUrl = (url: string) => {
  const match = url.match(/x\.com\/([^/?]+)/) || url.match(/twitter\.com\/([^/?]+)/);
  if (!match) throw new Error('Invalid Twitter URL');
  return match[1];
};

export const getTwitterFollowersAmount = async (url: string, attempts = 3): Promise<number> => {
  const username = getUsernameFromUrl(url);
  if (!bearerToken) {
    await getBearerToken();
  }
  try {
    const res = await fetch(`https://api.twitter.com/2/users/by/username/${username}?user.fields=public_metrics`, {
      headers: { Authorization: `Bearer ${bearerToken}` },
    });
    if ((res.status === 429 || res.status === 420) && attempts > 1) {
      const retryAfter = parseInt(res.headers.get('retry-after') ?? '60');
      logError(`Rate limited, sleeping for ${retryAfter}s, attempts left: ${attempts - 1}`);
      await new Promise((r) => setTimeout(r, retryAfter * 1000));
      return getTwitterFollowersAmount(url, attempts - 1);
    }
    if (res.status === 401 && attempts > 1) {
      await getBearerToken();
      return getTwitterFollowersAmount(url, attempts);
    }
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();
    return data.data.public_metrics.followers_count;
  } catch (e) {
    if (attempts > 1) {
      logError(`Error occurred, retrying (${attempts - 1} attempts left)`);
      return getTwitterFollowersAmount(url, attempts - 1);
    }
    throw e;
  }
};
