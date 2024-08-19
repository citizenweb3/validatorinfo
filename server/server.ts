import { Chain, Prisma, PrismaClient } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { CronJob } from 'cron';
import express, { Express } from 'express';
import WebSocket from 'ws';

import { ChainWithNodes, Validator } from './types';

const getData = async (lcd: string, path: string) => await fetch(lcd + path).then((data) => data.json());

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

export const getValidators = async (
  client: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
  chains: ChainWithNodes[],
) => {
  chains.map(async (chain) => {
    const validators: Validator[] = (
      await getData(
        chain.lcdNodes[0].url,
        '/cosmos/staking/v1beta1/validators?status=BOND_STATUS_BONDED&pagination.limit=500&pagination.count_total=false',
      )
    ).validators;
    validators.map(
      async ({
        commission,
        consensus_pubkey,
        delegator_shares,
        description,
        jailed,
        min_self_delegation,
        operator_address,
        tokens,
        unbonding_height,
        unbonding_time,
      }) => {
        await client.validator.upsert({
          where: { operator_address: operator_address },
          update: {
            tokens: tokens,
            moniker: description.moniker,
            delegator_shares: delegator_shares,
            details: description.details,
            identity: description.identity,
            website: description.website,
            security_contact: description.security_contact,
            jailed: jailed,
            rate: commission.commission_rates.rate,
            update_time: commission.update_time,
          },
          create: {
            chainId: chain.chainId,
            moniker: description.moniker,
            operator_address: operator_address,
            consensus_pubkey: consensus_pubkey.key,
            delegator_shares: delegator_shares,
            details: description.details,
            identity: description.identity,
            website: description.website,
            security_contact: description.security_contact,
            jailed: jailed,
            min_self_delegation: min_self_delegation,
            max_rate: commission.commission_rates.max_rate,
            max_change_rate: commission.commission_rates.max_change_rate,
            rate: commission.commission_rates.rate,
            update_time: commission.update_time,
            tokens: tokens,
            unbonding_height: unbonding_height,
            unbonding_time: unbonding_time,
          },
        });
      },
    );
  });
};

const runServer = async () => {
  const app: Express = express();
  const port = process.env.SERVER_PORT || 3333;

  const client = new PrismaClient();
  const chains = await client.chain.findMany({
    include: { grpcNodes: true, lcdNodes: true, rpcNodes: true, wsNodes: true },
  });

  app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
  });

  const getValidatorsJob = new CronJob(
    '* 5 * * * *', // cronTime
    async () => {
      await getValidators(client, chains);
      console.log('validators parsed');
    }, // onTick
    null, // onComplete
    true, // start
  );
  getValidatorsJob.start();
};

runServer();
