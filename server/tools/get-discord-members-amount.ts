import logger from '@/logger';

const { logError } = logger('get-discord-members-amount');

export const getDiscordMembersAmount = async (inviteCode: string, attempts = 3): Promise<number> => {
  try {
    const res = await fetch(`https://discord.com/api/v9/invites/${inviteCode}?with_counts=true`);

    if (res.status === 429 && attempts > 1) {
      const retryAfter = parseInt(res.headers.get('retry-after') ?? '60');
      logError(`Rate limited, sleeping for ${retryAfter}s, attempts left: ${attempts - 1}`);
      await new Promise((r) => setTimeout(r, retryAfter * 1000));
      return getDiscordMembersAmount(inviteCode, attempts - 1);
    }

    if (!res.ok) throw new Error(`Discord API error: ${res.status}`);

    const data = await res.json();
    if (typeof data.approximate_member_count !== 'number') {
      throw new Error(`Discord API response missing approximate_member_count for invite ${inviteCode}`);
    }
    return data.approximate_member_count;
  } catch (e) {
    if (attempts > 1) {
      logError(`Error occurred, retrying (${attempts - 1} attempts left)`);
      return getDiscordMembersAmount(inviteCode, attempts - 1);
    }
    throw e;
  }
};
