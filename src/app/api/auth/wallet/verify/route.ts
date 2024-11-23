import base64url from 'base64url';
import crypto from 'crypto';
import { NextResponse } from 'next/server';

import { WalletProof } from '@/api/auth/wallet/route';

export interface WalletVerificationResponse {
  address: string;
  extension: string;
  walletName: string;
}

export async function POST(req: Request) {
  if (req.method !== 'POST') {
    return new NextResponse('Only POST requests are supported', { status: 405 });
  }

  const { jwt } = await req.json();
  const splitedJwt = jwt.slice(1, -1).split('.');
  const token = {
    header: splitedJwt[0],
    payload: splitedJwt[1],
    signature: splitedJwt[2],
  };

  if (!token.payload || !token.signature || !token.header) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const hmac = crypto.createHmac('sha256', `${process.env.NEXTAUTH_SECRET}`);
  const verificationSignature = hmac.update(token.header + '.' + token.payload).digest('base64url');

  if (verificationSignature !== token.signature) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const { address, chainId, extension, walletName, expiration } = JSON.parse(
    base64url.decode(token.payload),
  ) as WalletProof;

  if (chainId !== 'cosmoshub-4') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const jwtExpiration = new Date(expiration).getTime(); // Время истечения в миллисекундах
  let currentDate = Date.now(); // Текущее время в миллисекундах

  if (jwtExpiration < currentDate) {
    return new NextResponse('JWT had expired', { status: 401 });
  }

  const supportedWallets = ['keplr', 'cosmostation', 'leap'];

  if (!supportedWallets.find((wallet) => extension === wallet)) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  // TODO: add fetching data from db for validators

  return new NextResponse(
    JSON.stringify({
      address: address,
      extension: extension,
      walletName: walletName,
    }),
    { status: 200 },
  );
}
