import { PrismaClient } from '@prisma/client';
import { CronJob } from 'cron';
import express, { Express } from 'express';
import WebSocket, { WebSocketServer } from 'ws';

const app: Express = express();
const port = process.env.PORT || 3333;

const client = new PrismaClient();
const wss = new WebSocket('wss://stride-rpc.w3coins.io:443/websocket');

wss.on('open', () => {
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
  console.log(parsedMessage)

});
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
