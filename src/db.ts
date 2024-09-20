import { PrismaClient } from '@prisma/client';

const db = () => {
  const prisma = new PrismaClient({
    log: [
      {
        emit: 'event',
        level: 'query',
      },
    ],
  });

  // prisma.$on("query", async (e) => {
  //   console.log(`${e.query} ${e.params}`);
  // });

  return prisma;
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof db>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? db();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;
