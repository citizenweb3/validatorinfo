#!/usr/bin/env node
// agents-tools/post-telegram.js — Post a message to Telegram channel via Bot API
// Usage:
//   node agents-tools/post-telegram.js --text "Hello world"
//   node agents-tools/post-telegram.js --text "<b>Bold</b> message" --parse-mode "HTML"
//   node agents-tools/post-telegram.js --text "*Bold* message" --parse-mode "Markdown"

const parseArgs = (argv) => {
  const args = { text: null, parseMode: 'HTML' };
  for (let i = 2; i < argv.length; i++) {
    switch (argv[i]) {
      case '--text':
        args.text = argv[++i];
        break;
      case '--parse-mode':
        args.parseMode = argv[++i];
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

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const channelId = process.env.TELEGRAM_CHANNEL_ID;

  if (!botToken) {
    console.log(JSON.stringify({
      success: false,
      error: 'TELEGRAM_BOT_TOKEN not configured',
    }));
    process.exit(1);
  }

  if (!channelId) {
    console.log(JSON.stringify({
      success: false,
      error: 'TELEGRAM_CHANNEL_ID not configured',
    }));
    process.exit(1);
  }

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: channelId,
        text: args.text,
        parse_mode: args.parseMode,
      }),
    });

    const data = await response.json();

    if (!data.ok) {
      console.log(JSON.stringify({
        success: false,
        error: data.description || 'Telegram API error',
      }));
      process.exit(1);
    }

    const messageId = data.result.message_id;
    const chatId = String(channelId).replace(/^-100/, '');
    const messageUrl = `https://t.me/c/${chatId}/${messageId}`;

    console.log(JSON.stringify({
      success: true,
      message_id: messageId,
      url: messageUrl,
    }));
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
