#!/usr/bin/env node
// agents-tools/post-discord.js — Post a message to Discord via webhook
// Usage:
//   node agents-tools/post-discord.js --text "Hello world"

const parseArgs = (argv) => {
  const args = { text: null };
  for (let i = 2; i < argv.length; i++) {
    switch (argv[i]) {
      case '--text':
        args.text = argv[++i];
        break;
    }
  }
  return args;
};

const main = async () => {
  const args = parseArgs(process.argv);

  if (!args.text) {
    console.log(JSON.stringify({ success: false, error: 'Missing --text argument' }));
    process.exit(1);
  }

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    console.log(JSON.stringify({
      success: false,
      error: 'DISCORD_WEBHOOK_URL not configured',
    }));
    process.exit(1);
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: args.text }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.log(JSON.stringify({
        success: false,
        error: `Discord API error (${response.status}): ${body}`,
      }));
      process.exit(1);
    }

    console.log(JSON.stringify({ success: true }));
    process.exit(0);
  } catch (err) {
    console.log(JSON.stringify({
      success: false,
      error: err.message || String(err),
    }));
    process.exit(1);
  }
};

main();
