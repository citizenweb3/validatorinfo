const test = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const fixturePath = path.join(__dirname, 'test-fixtures', 'run-post-twitter-with-mock.js');

const runPostTwitter = (env) =>
  spawnSync(process.execPath, [fixturePath, '--text', 'hello from test'], {
    encoding: 'utf8',
    env: {
      ...process.env,
      ...env,
    },
  });

test('posts with OAuth 2.0 user token when provided', () => {
  const result = runPostTwitter({
    TWITTER_HANDLE: 'citizen_web3',
    TWITTER_OAUTH2_ACCESS_TOKEN: 'oauth2-user-token',
  });

  assert.equal(result.status, 0, `stderr: ${result.stderr}\nstdout: ${result.stdout}`);

  const payload = JSON.parse(result.stdout.trim());

  assert.equal(payload.success, true);
  assert.equal(payload.tweet_id, 'oauth2-id');
  assert.equal(payload.url, 'https://x.com/citizen_web3/status/oauth2-id');
});

test('falls back to OAuth 1.0a credentials when OAuth 2.0 token is missing', () => {
  const result = runPostTwitter({
    TWITTER_HANDLE: 'therealvalinfo',
    TWITTER_API_KEY: 'legacy-app-key',
    TWITTER_API_SECRET: 'legacy-app-secret',
    TWITTER_ACCESS_TOKEN: 'legacy-access-token',
    TWITTER_ACCESS_TOKEN_SECRET: 'legacy-access-secret',
  });

  assert.equal(result.status, 0, `stderr: ${result.stderr}\nstdout: ${result.stdout}`);

  const payload = JSON.parse(result.stdout.trim());

  assert.equal(payload.success, true);
  assert.equal(payload.tweet_id, 'oauth1-id');
  assert.equal(payload.url, 'https://x.com/therealvalinfo/status/oauth1-id');
});
