import { bech32 } from 'bech32';

const MAX_ADDRESS_LENGTH = 128;

export const normalizeBech32Address = (address: string, expectedPrefix: string): string | null => {
  const candidate = address.trim();
  const prefix = expectedPrefix.trim().toLowerCase();
  if (!candidate || !prefix || candidate.length > MAX_ADDRESS_LENGTH) return null;

  try {
    const decoded = bech32.decode(candidate, MAX_ADDRESS_LENGTH);
    if (decoded.prefix.toLowerCase() !== prefix || decoded.words.length === 0) return null;
    return bech32.encode(prefix, decoded.words, MAX_ADDRESS_LENGTH).toLowerCase();
  } catch {
    return null;
  }
};
