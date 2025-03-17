import { NextRequest, NextResponse } from 'next/server';
import nodeService from '@/services/node-service';

export async function GET(req: NextRequest, ctx: any) {
  const chainId = parseInt(req.nextUrl.searchParams.get('chainId') as string);
  const result = await nodeService.getNodesByChainId(chainId as number);
  return NextResponse.json(result);
}
