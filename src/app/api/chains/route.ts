import { NextResponse } from 'next/server';

import ChainService from '@/services/chain-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request, ctx: any) {
  const chains = await ChainService.getAll([], 0, 1000);

  return NextResponse.json(chains);
}
