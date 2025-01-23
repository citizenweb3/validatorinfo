import { SearchResult } from '@/api/search/route';
import db from '@/db';

const findAll = async (query: string): Promise<SearchResult> => {
  const searchTerm = query.toLowerCase();

  const searchOptions: { contains: string; mode: 'insensitive' } = { contains: searchTerm, mode: 'insensitive' };

  const [validators, chains, tokens] = await Promise.all([
    db.validator.findMany({
      where: {
        OR: [{ moniker: searchOptions }, { details: searchOptions }],
      },
      take: 10,
    }),

    db.chain.findMany({
      where: {
        OR: [{ name: searchOptions }, { prettyName: searchOptions }, { denom: searchOptions }],
      },
      take: 10,
    }),

    db.chain.findMany({
      where: {
        denom: searchOptions,
      },
      take: 10,
    }),
  ]);

  return {
    validators,
    chains,
    tokens,
  };
};

export default {
  findAll,
};
