import { NextRequest, NextResponse } from 'next/server';
import nodeService from '@/services/node-service';

export async function GET(req: NextRequest) {
  try {
    const chainIdParam = req.nextUrl.searchParams.get('chainId');

    if (!chainIdParam) {
      return NextResponse.json({ error: 'chainId is required' }, { status: 400 });
    }

    const chainId = parseInt(chainIdParam);

    if (isNaN(chainId)) {
      return NextResponse.json({ error: 'chainId must be a number' }, { status: 400 });
    }

    const result = await nodeService.getNodesByChainId(chainId);
    return NextResponse.json(result ?? []);
  } catch (error) {
    console.error('Error fetching nodes by chain id:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
