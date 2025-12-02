import { PrismaClient } from '@prisma/client';
import { PrismaClient as EventsPrismaClient } from '@prisma/events-client';
import logger from '@/logger';

const { logError, logInfo } = logger('db-clients');

// Validate environment variables at startup
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}
if (!process.env.EVENTS_DATABASE_URL) {
  throw new Error('EVENTS_DATABASE_URL environment variable is required');
}

// Main database client factory
const createMainDb = () => {
  const prisma = new PrismaClient({
    log: [{ emit: 'event', level: 'query' }],
    datasources: {
      db: {
        url: process.env.DATABASE_URL + '&connection_limit=15',
      },
    },
  });

  prisma.$on('query', (e: any) => {
    if (e.duration > 1000) {
      logError(`Slow query detected (main DB): ${e.duration}ms`, { query: e.query });
    }
  });

  return prisma;
};

// Events database client factory
const createEventsDb = () => {
  const prisma = new EventsPrismaClient({
    log: [{ emit: 'event', level: 'query' }],
    datasources: {
      db: {
        url: process.env.EVENTS_DATABASE_URL + '&connection_limit=15',
      },
    },
  });

  prisma.$on('query', (e: any) => {
    if (e.duration > 1000) {
      logError(`Slow query detected (events DB): ${e.duration}ms`, { query: e.query });
    }
  });

  return prisma;
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof createMainDb> | undefined;
  eventsPrismaGlobal: ReturnType<typeof createEventsDb> | undefined;
} & typeof global;

// Thread-safe initialization with proper guards
let prisma: ReturnType<typeof createMainDb>;
let eventsClient: ReturnType<typeof createEventsDb>;

if (process.env.NODE_ENV === 'production') {
  prisma = createMainDb();
  eventsClient = createEventsDb();
} else {
  // Development: use global to prevent hot-reload connection multiplication
  if (!globalThis.prismaGlobal) {
    globalThis.prismaGlobal = createMainDb();
    logInfo('Initialized main database client');
  }
  if (!globalThis.eventsPrismaGlobal) {
    globalThis.eventsPrismaGlobal = createEventsDb();
    logInfo('Initialized events database client');
  }
  prisma = globalThis.prismaGlobal;
  eventsClient = globalThis.eventsPrismaGlobal;
}

export default prisma;
export { eventsClient };
