#!/usr/bin/env node

const Module = require('module');

class MockTwitterApi {
  constructor(auth) {
    this.auth = auth;
    this.v2 = {
      tweet: async () => ({
        data: {
          id: typeof this.auth === 'string' ? 'oauth2-id' : 'oauth1-id',
        },
      }),
    };
  }
}

const originalLoad = Module._load;

Module._load = function patchedLoad(request, parent, isMain) {
  if (request === 'twitter-api-v2') {
    return { TwitterApi: MockTwitterApi };
  }

  return originalLoad.call(this, request, parent, isMain);
};

require('../post-twitter.js');
