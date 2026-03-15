#!/usr/bin/env node
// agents-tools/post-twitter.js — Post a tweet or thread via Twitter API v2
// Usage:
//   node agents-tools/post-twitter.js --text "Hello world"
//   node agents-tools/post-twitter.js --thread "Tweet 1|||Tweet 2|||Tweet 3"
//   node agents-tools/post-twitter.js --text "Reply text" --reply-to 123456789

const { TwitterApi } = require('twitter-api-v2');

const TWITTER_HANDLE = 'therealvalinfo';
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

const parseArgs = (argv) => {
  const args = { text: null, thread: null, replyTo: null };
  for (let i = 2; i < argv.length; i++) {
    switch (argv[i]) {
      case '--text':
        args.text = argv[++i];
        break;
      case '--thread':
        args.thread = argv[++i];
        break;
      case '--reply-to':
        args.replyTo = argv[++i];
        break;
    }
  }
  return args;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const tweetWithRetry = async (client, params, attempt = 1) => {
  try {
    return await client.v2.tweet(params);
  } catch (err) {
    if (attempt >= MAX_RETRIES) {
      throw err;
    }
    const isRateLimit = err.code === 429 || (err.data && err.data.status === 429);
    if (isRateLimit) {
      const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
      await sleep(delay);
      return tweetWithRetry(client, params, attempt + 1);
    }
    throw err;
  }
};

const buildTweetUrl = (tweetId) =>
  `https://x.com/${TWITTER_HANDLE}/status/${tweetId}`;

const main = async () => {
  const args = parseArgs(process.argv);

  if (!args.text && !args.thread) {
    console.log(JSON.stringify({ success: false, error: 'Missing --text or --thread argument' }));
    process.exit(1);
  }

  const apiKey = process.env.TWITTER_API_KEY;
  const apiSecret = process.env.TWITTER_API_SECRET;
  const accessToken = process.env.TWITTER_ACCESS_TOKEN;
  const accessTokenSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET;

  if (!apiKey || !apiSecret || !accessToken || !accessTokenSecret) {
    console.log(JSON.stringify({
      success: false,
      error: 'Twitter API keys not configured. Set TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_TOKEN_SECRET',
    }));
    process.exit(1);
  }

  const client = new TwitterApi({
    appKey: apiKey,
    appSecret: apiSecret,
    accessToken: accessToken,
    accessSecret: accessTokenSecret,
  });

  try {
    if (args.text) {
      const params = { text: args.text };
      if (args.replyTo) {
        params.reply = { in_reply_to_tweet_id: args.replyTo };
      }

      const result = await tweetWithRetry(client, params);
      const tweetId = result.data.id;

      console.log(JSON.stringify({
        success: true,
        tweet_id: tweetId,
        url: buildTweetUrl(tweetId),
      }));
      process.exit(0);
    }

    if (args.thread) {
      const tweets = args.thread.split('|||').map((t) => t.trim()).filter(Boolean);

      if (tweets.length === 0) {
        console.log(JSON.stringify({ success: false, error: 'Thread is empty after splitting by |||' }));
        process.exit(1);
      }

      const results = [];
      let previousTweetId = args.replyTo || null;

      for (const tweetText of tweets) {
        const params = { text: tweetText };
        if (previousTweetId) {
          params.reply = { in_reply_to_tweet_id: previousTweetId };
        }

        const result = await tweetWithRetry(client, params);
        const tweetId = result.data.id;
        previousTweetId = tweetId;

        results.push({
          tweet_id: tweetId,
          url: buildTweetUrl(tweetId),
        });
      }

      console.log(JSON.stringify({
        success: true,
        tweets: results,
      }));
      process.exit(0);
    }
  } catch (err) {
    const message = err.data
      ? JSON.stringify(err.data)
      : err.message || String(err);

    console.log(JSON.stringify({ success: false, error: message }));
    process.exit(1);
  }
};

main();
