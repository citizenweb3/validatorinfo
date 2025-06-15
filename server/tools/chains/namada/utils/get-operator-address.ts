import { Buffer } from 'buffer';
import { bech32m } from 'bech32';
import logger from '@/logger';
import fetchChainData from '@/server/tools/get-chain-data';

const { logError } = logger('namada-consensus-address');

const base64ToBech32m = (value: string): string => {
  const raw = Buffer.from(value, 'base64');
  if (raw.length !== 22 || raw[0] !== 0x01)
    throw new Error(`Invalid format base64 addr: ${raw.toString('hex')}`);

  const id21 = Buffer.concat([raw.subarray(0, 1), raw.subarray(2)]);
  const words = bech32m.toWords(id21);
  return bech32m.encode('tnam', words);
};

const getOperatorAddress = async (
  consensusAddress: string,
  chainName: string,
): Promise<string | null> => {
  const hex = consensusAddress.replace(/^0x/i, '').toUpperCase();
  const path = `/vp/pos/validator_by_tm_addr/${hex}`;
  const qs = new URLSearchParams({ path: `"${path}"` }).toString();
  const url = `/abci_query?${qs}`;

  try {
    const response = await fetchChainData<{
      result: {
        response: {
          value: string | null;
        }
      }
    }>(chainName, 'rpc', url);

    if (!response.result.response.value) {
      logError(`No value for consensus address ${consensusAddress} on chain ${chainName}`);
      return null;
    }
    return base64ToBech32m(response.result.response.value);
  } catch (error) {
    logError(`Can't fetch operator address for chain ${chainName}: ${error}`);
    return null;
  }
};

export default getOperatorAddress;
