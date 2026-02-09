import { ripemd160, sha256 } from '@cosmjs/crypto';
import { fromBase64, fromBech32, toBech32 } from '@cosmjs/encoding';

export const fromPubkeyToValcons = (pubkey: string, prefix: string): string => {
  try {
    if (pubkey) {
      const ed25519PubkeyRaw = fromBase64(pubkey);
      const addressData = sha256(ed25519PubkeyRaw).slice(0, 20);
      return toBech32(prefix + 'valcons', addressData);
    }
  } catch {} // don't need to handle it for all noncosmos chains
  return '';
}

export function fromValoperToAccount(operatorAddress: string, accountPrefix: string): string {
  try {
    if (operatorAddress) {
      const { data } = fromBech32(operatorAddress);
      return toBech32(accountPrefix, data);
    }
  } catch {} // don't need to handle it for all noncosmos chains
  return '';
}
