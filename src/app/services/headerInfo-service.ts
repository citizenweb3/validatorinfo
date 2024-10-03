import db from '@/db';

const HeaderInfoService = async (): Promise<{ chains: number; validators: number }> => {
  const [chains, validators] = await Promise.all([db.chain.count(), db.validator.count()]);
  return { chains, validators };
};

export default HeaderInfoService;
