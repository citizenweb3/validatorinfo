import WebSocket from 'ws';

import { ChainWithNodes } from '../types';

async function initWss(chains: ChainWithNodes[]) {
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
