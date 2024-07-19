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
