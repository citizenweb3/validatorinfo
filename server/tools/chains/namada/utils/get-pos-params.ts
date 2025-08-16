import fetchChainData from '@/server/tools/get-chain-data';
import { bigIntPow } from '@/server/utils/bigint-pow';

const parseU64 = (buf: Buffer, offset: number) => {
  return [Number(buf.readBigUInt64LE(offset)), offset + 8];
};

const parseDec = (buf: Buffer, offset = 0) => {
  const bytes = buf.subarray(offset, offset + 32);
  let hex = '';
  for (let i = bytes.length - 1; i >= 0; i--) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  let n = BigInt('0x' + hex);
  if (bytes[31] & 0x80) n = n - (BigInt(1) << BigInt(256));
  const precision = BigInt(12);
  const divisor = bigIntPow(BigInt(10), precision);
  const isNegative = n < BigInt(0);
  const abs = isNegative ? -n : n;
  const intPart = abs / divisor;
  const fracPart = (abs % divisor).toString().padStart(Number(precision), '0');
  return (isNegative ? '-' : '') + intPart.toString() + '.' + fracPart;
};

export const getPosParams = async (chainName: string) => {
  const path = '/vp/pos/pos_params';
  const qs = new URLSearchParams({ path: `"${path}"`, prove: 'false' }).toString();
  const url = `/abci_query?${qs}`;

  try {
    const data = await fetchChainData<{
      result: {
        response: {
          value: string | null;
        };
      };
    }>(chainName, 'rpc', url);

    if (!data.result.response.value) throw new Error(`RPC returned null for path: ${path}`);
    const buf = Buffer.from(data.result.response.value, 'base64');

    const [max_validator_slots, o1] = parseU64(buf, 0);
    const [pipeline_len, o2] = parseU64(buf, o1);
    const [unbonding_len, o3] = parseU64(buf, o2);

    const tm_votes_per_token = parseDec(buf, o3);
    let o4 = o3 + 32;
    const block_proposer_reward = parseDec(buf, o4);
    o4 += 32;
    const block_vote_reward = parseDec(buf, o4);
    o4 += 32;
    const max_inflation_rate = parseDec(buf, o4);
    o4 += 32;
    const target_staked_ratio = parseDec(buf, o4);
    o4 += 32;
    const duplicate_vote_min_slash_rate = parseDec(buf, o4);
    o4 += 32;
    const light_client_attack_min_slash_rate = parseDec(buf, o4);
    o4 += 32;

    const [cubic_slashing_window_length, o5] = parseU64(buf, o4);
    const [validator_stake_threshold_lo, o6a] = parseU64(buf, o5);
    const [validator_stake_threshold_hi, o6b] = parseU64(buf, o6a);
    const validator_stake_threshold =
      (BigInt(validator_stake_threshold_hi) << BigInt(64)) + BigInt(validator_stake_threshold_lo);
    const o6c = o6b + 16;
    const [liveness_window_check, o7] = parseU64(buf, o6c);

    const liveness_threshold = parseDec(buf, o7);
    let o8 = o7 + 32;
    const rewards_gain_p = parseDec(buf, o8);
    o8 += 32;
    const rewards_gain_d = parseDec(buf, o8);
    o8 += 32;
    const [max_proposal_period] = parseU64(buf, o8);

    const params = {
      max_validator_slots,
      pipeline_len,
      unbonding_len,
      tm_votes_per_token,
      block_proposer_reward,
      block_vote_reward,
      max_inflation_rate,
      target_staked_ratio,
      duplicate_vote_min_slash_rate,
      light_client_attack_min_slash_rate,
      cubic_slashing_window_length,
      validator_stake_threshold: validator_stake_threshold.toString(),
      liveness_window_check,
      liveness_threshold,
      rewards_gain_p,
      rewards_gain_d,
      max_proposal_period,
    };

    return params;
  } catch (e) {
    throw new Error(`Error with getting pos params: ${e}`);
  }
};
