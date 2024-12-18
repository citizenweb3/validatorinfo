import db from '@/db';

const getValidatorsAndChains = async (): Promise<{ chains: number; validators: number }> => {
  const [chains, validators] = await Promise.all([db.chain.count(), db.validator.count()]);
  return { chains, validators };
};

const HeaderInfoService = {
  getValidatorsAndChains,
};

export default HeaderInfoService;
