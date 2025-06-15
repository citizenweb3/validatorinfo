import fetchChainData from '@/server/tools/get-chain-data';

interface ValidatorsResponse {
  result: {
    validators: { address: string }[];
    total: string;
    count: string;
  };
}

const fetchValidatorsActiveSet = async (
  chainName: string,
  height: number
): Promise<string[]> => {
  let page = 1;
  const perPage = 100;
  let consensusAddresses: string[] = [];
  while (true) {
    const resp = await fetchChainData<ValidatorsResponse>(
      chainName,
      'rpc',
      `/validators?height=${height}&page=${page}&per_page=${perPage}`
    );
    if (!resp?.result?.validators) break;
    consensusAddresses.push(...resp.result.validators.map(v => v.address.toUpperCase()));
    if (resp.result.validators.length < perPage) break;
    page++;
  }
  return consensusAddresses;
};

export default fetchValidatorsActiveSet;
