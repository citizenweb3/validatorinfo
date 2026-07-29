import assert from 'node:assert/strict';
import test from 'node:test';

import {
  type EthereumSupplyFetch,
  convertCoinGeckoTotalSupplyToWei,
  getEthereumTotalSupply,
  parseEtherscanTotalSupply,
  sourcesDifferBeyondLimit,
} from '@/server/tools/chains/ethereum/get-total-supply';

const ETHERSCAN_FIXTURE = {
  status: '1',
  message: 'OK',
  result: {
    EthSupply: '122373866217800000000000000',
    Eth2Staking: '2940327167090033000000000',
    BurntFees: '4610942856337430575173814',
    WithdrawnTotal: '7618584348954597000000000',
  },
};

const COINGECKO_FIXTURE = {
  market_data: {
    total_supply: 120682600.3094177,
  },
};

const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const createFetch =
  (handleRequest: (url: URL) => Response | Promise<Response>): EthereumSupplyFetch =>
  async (input) =>
    handleRequest(new URL(input));

test('the official Etherscan fixture excludes beacon withdrawals from the supply formula', () => {
  assert.equal(parseEtherscanTotalSupply(ETHERSCAN_FIXTURE), '120703250528552602424826186');
});

test('CoinGecko whole ETH supply converts to a wei decimal string', () => {
  assert.equal(
    convertCoinGeckoTotalSupplyToWei(COINGECKO_FIXTURE.market_data.total_supply),
    '120682600309417700000000000',
  );
  assert.equal(convertCoinGeckoTotalSupplyToWei(Number.NaN), null);
  assert.equal(convertCoinGeckoTotalSupplyToWei(0), null);
  assert.equal(convertCoinGeckoTotalSupplyToWei('120682600.3094177'), null);
});

test('a missing Etherscan key uses CoinGecko without calling Etherscan', async () => {
  const requestedHosts: string[] = [];
  const fetchFn = createFetch((url) => {
    requestedHosts.push(url.hostname);
    return jsonResponse(COINGECKO_FIXTURE);
  });

  const totalSupply = await getEthereumTotalSupply(fetchFn, '   ');

  assert.equal(totalSupply, '120682600309417700000000000');
  assert.deepEqual(requestedHosts, ['api.coingecko.com']);
});

test('Etherscan remains primary when both valid sources agree within two percent', async () => {
  const fetchFn = createFetch((url) =>
    jsonResponse(url.hostname === 'api.etherscan.io' ? ETHERSCAN_FIXTURE : COINGECKO_FIXTURE),
  );

  const totalSupply = await getEthereumTotalSupply(fetchFn, 'secret-key');

  assert.equal(totalSupply, '120703250528552602424826186');
});

test('valid Etherscan supply remains primary when CoinGecko is unavailable', async () => {
  const fetchFn = createFetch((url) => {
    if (url.hostname === 'api.etherscan.io') {
      assert.equal(url.searchParams.get('apikey'), 'secret-key');
      return jsonResponse(ETHERSCAN_FIXTURE);
    }

    return jsonResponse({ error: 'rate limited' }, 429);
  });

  const totalSupply = await getEthereumTotalSupply(fetchFn, 'secret-key');

  assert.equal(totalSupply, '120703250528552602424826186');
});

test('CoinGecko is the fallback when Etherscan reports an API error', async () => {
  const fetchFn = createFetch((url) => {
    if (url.hostname === 'api.etherscan.io') {
      return jsonResponse({ status: '0', message: 'NOTOK', result: 'rate limit' });
    }

    return jsonResponse(COINGECKO_FIXTURE);
  });

  const totalSupply = await getEthereumTotalSupply(fetchFn, 'secret-key');

  assert.equal(totalSupply, '120682600309417700000000000');
});

test('CoinGecko wins when valid sources differ by more than two percent', async () => {
  const fetchFn = createFetch((url) => {
    if (url.hostname === 'api.etherscan.io') {
      return jsonResponse({
        status: '1',
        result: {
          EthSupply: '110000000000000000000000000',
          Eth2Staking: '0',
          BurntFees: '0',
          WithdrawnTotal: '0',
        },
      });
    }

    return jsonResponse(COINGECKO_FIXTURE);
  });

  const totalSupply = await getEthereumTotalSupply(fetchFn, 'secret-key');

  assert.equal(totalSupply, '120682600309417700000000000');
  assert.equal(sourcesDifferBeyondLimit('110000000000000000000000000', '120682600309417700000000000'), true);
});

test('malformed or non-positive source data cannot become total supply', async () => {
  assert.equal(parseEtherscanTotalSupply({ ...ETHERSCAN_FIXTURE, status: '0' }), null);
  assert.equal(
    parseEtherscanTotalSupply({
      ...ETHERSCAN_FIXTURE,
      result: { ...ETHERSCAN_FIXTURE.result, BurntFees: 'not-an-integer' },
    }),
    null,
  );
  assert.equal(
    parseEtherscanTotalSupply({
      status: '1',
      result: { EthSupply: '1', Eth2Staking: '0', BurntFees: '2' },
    }),
    null,
  );

  const fetchFn = createFetch((url) => {
    if (url.hostname === 'api.etherscan.io') {
      return jsonResponse({ status: '1', result: { EthSupply: null } });
    }

    return jsonResponse({ market_data: { total_supply: null } });
  });

  assert.equal(await getEthereumTotalSupply(fetchFn, 'secret-key'), null);
});
