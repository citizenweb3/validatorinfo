import { formatBaseUnits } from '@/utils/decimal-string';

type KnownDenom = { symbol: string; decimals: number };

// Chain-primary denoms plus the known secondary tokens that live beside them. The transfer feed
// returns raw base-unit amounts; without this map anything but the staking token would render as
// unreadable micro-units (e.g. "45000 uphoton"). Unknown denoms stay raw with the full value in
// the tooltip — never scaled by a guessed exponent.
const KNOWN_DENOMS_BY_CHAIN: Record<string, Record<string, KnownDenom>> = {
  cosmoshub: {
    uatom: { symbol: 'ATOM', decimals: 6 },
  },
  atomone: {
    uatone: { symbol: 'ATONE', decimals: 6 },
    uphoton: { symbol: 'PHOTON', decimals: 6 },
  },
};

const shortenDenom = (denom: string): string => (denom.length > 14 ? `${denom.slice(0, 12)}…` : denom);

export const formatTransferAmount = (
  chainName: string,
  amount: string,
  denom: string,
): { display: string; full: string } => {
  const known = KNOWN_DENOMS_BY_CHAIN[chainName]?.[denom];
  if (known) {
    try {
      const value = formatBaseUnits(amount, known.decimals);
      return { display: `${value} ${known.symbol}`, full: `${value} ${known.symbol} (${amount} ${denom})` };
    } catch {
      // fall through to the raw form below
    }
  }
  return { display: `${amount} ${shortenDenom(denom)}`, full: `${amount} ${denom}` };
};
