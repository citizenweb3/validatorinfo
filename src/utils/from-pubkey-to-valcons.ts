import { fromBase64, toBech32 } from '@cosmjs/encoding';
import { sha256 } from '@cosmjs/crypto';

export function fromPubkeyToValcons(pubkey: string, prefix: string): string {
  if (pubkey) {
    const ed25519PubkeyRaw = fromBase64(pubkey);
    const addressData = sha256(ed25519PubkeyRaw).slice(0, 20);
    return toBech32(prefix+'valcons', addressData);
  } else {
    return '';
  }
}
