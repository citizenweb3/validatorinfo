import { PrismaClient } from '@prisma/client';
import { CronJob } from 'cron';
import express, { Express } from 'express';
import WebSocket from 'ws';

const app: Express = express();
const port = process.env.PORT || 3333;

const client = new PrismaClient();

async function initWss() {
  const chains = await client.chain.findMany({
    include: { wsNodes: true },
  });
  console.log('Connecting chains to ws');
  for (const chain of chains) {
    console.log(chain.prettyName + ' connecting...');
    try {
      const wss = new WebSocket(chain.wsNodes[0].url);
      wss.on('open', () => {
        console.log(chain.prettyName + ' connected ✅');
        const subscriptionRequest = JSON.stringify({
          jsonrpc: '2.0',
          method: 'subscribe',
          params: ["tm.event = 'NewBlock'"],
          id: 1,
        });

        wss.send(subscriptionRequest);
      });

      wss.on('message', (message) => {
        const parsedMessage = JSON.parse(message.toString());
        console.log(parsedMessage.result.data ? parsedMessage.result.data.value.signatures : null);
      });
    } catch (e) {
      console.log('Something went wrong: ' + e);
    }
  }
}

initWss();

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

const job = new CronJob(
  '* * * * * *', // cronTime
  function () {
    console.log('You will see this message every second');
  }, // onTick
  null, // onComplete
  true, // start
  'America/Los_Angeles', // timeZone
);

job.start();
