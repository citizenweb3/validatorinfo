#!/usr/bin/env node
// agents-tools/search-rag.js — Search the internal RAG endpoint for podcast and CW3 knowledge base chunks.
// Usage:
//   node agents-tools/search-rag.js "privacy in blockchain"
//   node agents-tools/search-rag.js "staking" --limit 5 --speaker GUEST --validator-id 123

const KNOWN_FLAGS = new Set(['--limit', '--speaker', '--validator-id', '--help', '-h']);

const USAGE = `Usage: search-rag.js <query> [--limit N] [--speaker GUEST|HOST|ALL] [--validator-id ID]

Environment:
  RAG_API_TOKEN   Required shared secret sent as x-rag-api-token
  RAG_API_URL     Optional base URL, defaults to http://frontend:3000`;

const parseArgs = (argv) => {
  const args = { query: null, limit: '15', speaker: null, validatorId: null };
  let i = 2;

  // First non-flag argument is the query
  if (i < argv.length && !argv[i].startsWith('-')) {
    args.query = argv[i];
    i++;
  }

  while (i < argv.length) {
    const flag = argv[i];

    if (flag === '--help' || flag === '-h') {
      console.log(USAGE);
      process.exit(0);
    }

    if (!KNOWN_FLAGS.has(flag)) {
      console.error(`Unknown flag: ${flag}\n`);
      console.error(USAGE);
      process.exit(1);
    }

    switch (flag) {
      case '--limit':
        args.limit = argv[++i];
        break;
      case '--speaker':
        args.speaker = argv[++i];
        break;
      case '--validator-id':
        args.validatorId = argv[++i];
        break;
    }

    if (args.limit === undefined || args.speaker === undefined || args.validatorId === undefined) {
      console.error(`${flag} requires a value\n`);
      console.error(USAGE);
      process.exit(1);
    }

    i++;
  }

  return args;
};

const main = async () => {
  const args = parseArgs(process.argv);

  if (!args.query) {
    console.log(JSON.stringify({ success: false, error: 'Missing query argument' }));
    process.exit(1);
  }

  const apiToken = process.env.RAG_API_TOKEN;
  if (!apiToken) {
    console.log(JSON.stringify({ success: false, error: 'RAG_API_TOKEN is required' }));
    process.exit(1);
  }

  const baseUrl = (process.env.RAG_API_URL || 'http://frontend:3000').replace(/\/+$/, '');

  const params = new URLSearchParams({ q: args.query, limit: args.limit });
  if (args.speaker) {
    params.set('speaker', args.speaker);
  }
  if (args.validatorId) {
    params.set('validatorId', args.validatorId);
  }

  const url = `${baseUrl}/api/rag/search?${params.toString()}`;

  try {
    const response = await fetch(url, {
      headers: {
        'x-rag-api-token': apiToken,
        'Accept': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.log(JSON.stringify(data));
      process.exit(1);
    }

    console.log(JSON.stringify(data));
    process.exit(0);
  } catch (err) {
    console.log(JSON.stringify({ success: false, error: err.message || String(err) }));
    process.exit(1);
  }
};

main();
