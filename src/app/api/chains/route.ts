import { NextResponse } from 'next/server';

import ChainService from '@/services/chain-service';

export async function GET(req: Request, ctx: any) {
  const chains = await ChainService.getAll([], 0, 1000);

  return NextResponse.json(chains);
}
