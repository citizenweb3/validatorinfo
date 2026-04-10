import db from '@/db';
import logger from '@/logger';
import { getChainParams } from '@/server/tools/chains/params';
import { getTelegramMembersAmount } from '@/server/tools/get-telegram-members-amount';
import { getDiscordMembersAmount } from '@/server/tools/get-discord-members-amount';

const { logError, logInfo } = logger('update-community-members');

const updateCommunityMembers = async (chainNames: string[]) => {
  for (const chainName of chainNames) {
    const chainParams = getChainParams(chainName);

    try {
      const dbChain = await db.chain.findFirst({
        where: { chainId: chainParams.chainId },
      });
      if (!dbChain) {
        logError(`Chain ${chainParams.chainId} not found in database`);
        continue;
      }

      logInfo(`${chainName} updating community members`);

      let telegramMembers: number | null = null;
      let discordMembers: number | null = null;

      if (chainParams.telegramUrl) {
        try {
          telegramMembers = await getTelegramMembersAmount(chainParams.telegramUrl);
          logInfo(`${chainName} telegram members: ${telegramMembers}`);
        } catch (e) {
          logError(`${chainName} failed to fetch telegram members: `, e);
        }
      }

      if (chainParams.discordInviteCode) {
        try {
          discordMembers = await getDiscordMembersAmount(chainParams.discordInviteCode);
          logInfo(`${chainName} discord members: ${discordMembers}`);
        } catch (e) {
          logError(`${chainName} failed to fetch discord members: `, e);
        }
      }

      const updateData: { telegramMembers?: number; discordMembers?: number } = {};
      if (telegramMembers !== null) {
        updateData.telegramMembers = telegramMembers;
      }
      if (discordMembers !== null) {
        updateData.discordMembers = discordMembers;
      }

      if (Object.keys(updateData).length > 0) {
        await db.chain.update({
          where: { id: dbChain.id },
          data: updateData,
        });
      }
    } catch (e) {
      logError(`${chainName} failed to update community members: `, e);
    }
  }
};

export default updateCommunityMembers;
