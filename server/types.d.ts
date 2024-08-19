import { Chain, GrpcNode, LcdNode, RpcNode, WsNode } from '@prisma/client';

declare type NewBlock = {
  jsonrpc: '2.0';
  id: 1;
  result: {
    query: "tm.event = 'NewBlock'";
    data: { type: 'tendermint/event/NewBlock'; value: [] };
    events: {
      'transfer.recipient': any[];
      'transfer.amount': any[];
      'rewards.amount': any[];
      'rewards.validator': any[];
      'liveness.address': string[];
      'liveness.missed_blocks': string[];
      'coin_received.receiver': any[];
      'coin_received.amount': any[];
      'tm.event': ['NewBlock'];
      'message.sender': string[];
      'commission.validator': string[];
      'liveness.height': string[];
      'coin_spent.spender': string[];
      'transfer.sender': string[];
      'coin_spent.amount': string[];
      'commission.amount': string[];
    };
  };
};

export type ChainWithNodes = Chain & {
  rpcNodes: RpcNode[];
  grpcNodes: GrpcNode[];
  lcdNodes: LcdNode[];
  wsNodes: WsNode[];
};

export interface Validator {
  operator_address: string;
  consensus_pubkey: ConsensusPubkey;
  jailed: boolean;
  status: BondStatus;
  tokens: string;
  delegator_shares: string;
  description: ValidatorDescription;
  unbonding_height: string;
  unbonding_time: string;
  commission: ValidatorCommission;
  min_self_delegation: string;
}

interface ConsensusPubkey {
  '@type': string;
  key: string;
}

interface ValidatorDescription {
  moniker: string;
  identity: string;
  website: string;
  security_contact: string;
  details: string;
}

interface ValidatorCommission {
  commission_rates: CommissionRates;
  update_time: string;
}

interface CommissionRates {
  rate: string;
  max_rate: string;
  max_change_rate: string;
}

type BondStatus = 'BOND_STATUS_BONDED';
