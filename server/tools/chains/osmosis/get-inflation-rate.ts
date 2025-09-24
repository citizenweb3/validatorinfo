import { QueryClient, setupBankExtension } from '@cosmjs/stargate';

import logger from '@/logger';
import { GetInflationRate } from '@/server/tools/chains/chain-indexer';
import fetchChainData from '@/server/tools/get-chain-data';
import getTendermintClient from '@/server/tools/get-tendermint-client';


const { logError, logDebug } = logger('osmosis-inflation-rate');

const getInflationRate: GetInflationRate = async (chain) => {
  try {
    const tmClient = await getTendermintClient(chain.name);
    const query = QueryClient.withExtensions(tmClient, setupBankExtension);

    let totalSupply = '';
    try {
      const supply = await query.bank.supplyOf(chain.minimalDenom);
      totalSupply = supply.amount;
    } catch (e) {
      const allDenom = await query.bank.totalSupply();
      const findSupply = allDenom.supply.find(
        (c) => c.denom === chain.minimalDenom || c.denom === chain.denom.toLowerCase(),
      );
      totalSupply = findSupply?.amount ?? '';
    }
    if (!totalSupply || totalSupply === '0') {
      logError(`Total supply not found for ${chain.name}`);
      return null;
    }
    const totalSupplyFloat = parseFloat(totalSupply) / 10 ** chain.coinDecimals;

    const epochProvisionsEndpoint =
      chain.name === 'osmosis' ? '/osmosis/mint/v1beta1/epoch_provisions' : '/mint/v1beta1/epoch_provisions';

    const provision = await fetchChainData<{ epoch_provisions: string }>(chain.name, 'rest', epochProvisionsEndpoint);
    const epochProvisions = parseFloat(provision.epoch_provisions) / 10 ** chain.coinDecimals;

    let epochsPerYear = 365;
    try {
      const epochsParams = await fetchChainData<{ epochs: { identifier: string; duration: string }[] }>(
        chain.name,
        'rest',
        `/${chain.name}/epochs/v1beta1/epochs`,
      );
      const day = epochsParams.epochs.find((e) => e.identifier === 'day');
      if (day?.duration?.endsWith('s')) {
        const seconds = parseFloat(day.duration.replace('s', ''));
        if (seconds > 0) epochsPerYear = Math.round((365 * 24 * 3600) / seconds);
      }
    } catch (e) {
      logError(
        `Can't fetch epochs duration for ${chain.name} with error: ${e}, default amount of epochs per year - ${epochsPerYear}`,
      );
    }
    const annualIssuance = epochProvisions * epochsPerYear;
    const inflation = annualIssuance / totalSupplyFloat;

    logDebug(`Inflation for ${chain.name}: ${inflation}`);
    return inflation;

  } catch (e) {
    logError(`Can't compute inflation for ${chain.name}`, e);
    return null;
  }
};

export default getInflationRate;
