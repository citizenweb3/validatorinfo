import { NextResponse } from 'next/server';

import validatorService from '@/services/validator-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request, ctx: any) {
  return NextResponse.json(await validatorService.getAll([], 0, 100));
}
