import db, { eventsClient } from '@/db';
import logger from '@/logger';

const { logInfo, logError } = logger('update-aztec-validators-history');

const START_DATE = new Date('2025-11-10');

const generateDateRange = (startDate: Date, endDate: Date): string[] => {
  const dates: string[] = [];
  const current = new Date(startDate);
  current.setUTCHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setUTCHours(0, 0, 0, 0);

  while (current <= end) {
    dates.push(current.toISOString().split('T')[0]);
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return dates;
};

interface AdminChangeEvent {
  timestamp: Date;
  providerIdentifier: string;
  admin: string;
}

export const updateAztecValidatorsHistory = async (chainName: 'aztec' | 'aztec-testnet'): Promise<void> => {
  logInfo(`Starting validators history update for ${chainName}`);

  try {
    const chain = await db.chain.findUnique({
      where: { name: chainName },
    });

    if (!chain) {
      logError(`Chain not found: ${chainName}`);
      return;
    }

    const [registeredEvents, adminUpdatedEvents] = await Promise.all([
      eventsClient.aztecProviderRegisteredEvent.findMany({
        where: { chainId: chain.id },
        orderBy: { timestamp: 'asc' },
      }),
      eventsClient.aztecProviderAdminUpdatedEvent.findMany({
        where: { chainId: chain.id },
        orderBy: { timestamp: 'asc' },
      }),
    ]);

    if (registeredEvents.length === 0 && adminUpdatedEvents.length === 0) {
      logInfo(`${chainName}: No provider events found`);
      return;
    }

    logInfo(
      `${chainName}: Found ${registeredEvents.length} provider registered events and ${adminUpdatedEvents.length} admin updated events`
    );

    const adminChanges: AdminChangeEvent[] = [];

    for (const event of registeredEvents) {
      adminChanges.push({
        timestamp: event.timestamp,
        providerIdentifier: event.providerIdentifier,
        admin: event.providerAdmin.toLowerCase(),
      });
    }

    for (const event of adminUpdatedEvents) {
      adminChanges.push({
        timestamp: event.timestamp,
        providerIdentifier: event.providerIdentifier,
        admin: event.newAdmin.toLowerCase(),
      });
    }

    adminChanges.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const dates = generateDateRange(START_DATE, today);

    const providerAdmins = new Map<string, string>();
    let eventIndex = 0;

    const historyData: Array<{ date: Date; validatorsCount: number }> = [];

    for (const dateStr of dates) {
      const dayEnd = new Date(dateStr + 'T23:59:59.999Z');

      while (eventIndex < adminChanges.length && adminChanges[eventIndex].timestamp <= dayEnd) {
        const event = adminChanges[eventIndex];
        providerAdmins.set(event.providerIdentifier, event.admin);
        eventIndex++;
      }

      const uniqueAdmins = new Set(providerAdmins.values());

      historyData.push({
        date: new Date(dateStr + 'T00:00:00.000Z'),
        validatorsCount: uniqueAdmins.size,
      });
    }

    let upserted = 0;
    for (const record of historyData) {
      await db.chainValidatorsHistory.upsert({
        where: {
          chainId_date: {
            chainId: chain.id,
            date: record.date,
          },
        },
        create: {
          chainId: chain.id,
          date: record.date,
          validatorsCount: record.validatorsCount,
        },
        update: {
          validatorsCount: record.validatorsCount,
        },
      });
      upserted++;
    }

    const currentUniqueAdmins = new Set(providerAdmins.values());

    logInfo(`${chainName}: Validators history updated - ${upserted} records upserted, current count: ${currentUniqueAdmins.size}`);
  } catch (error: any) {
    logError(`${chainName}: Failed to update validators history: ${error.message}`);
    throw error;
  }
};

export default updateAztecValidatorsHistory;
