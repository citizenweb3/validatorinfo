import { Chain, Validator } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

import searchService from '@/services/search-service';
import { ChainWithParams } from '@/services/chain-service';

export interface SearchResult {
  validators: Validator[];
  chains: Chain[];
  tokens: ChainWithParams[];
}

export async function GET(req: NextRequest, ctx: any) {
  const searchQuery = req.nextUrl.searchParams.get('q') as string;
  const result = await searchService.findAll(searchQuery as string);

  return NextResponse.json(result);
}
