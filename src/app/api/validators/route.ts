import { NextResponse } from 'next/server';

import validatorService from '@/services/validator-service';

export async function GET(req: Request, ctx: any) {
  return NextResponse.json(await validatorService.getAll([], 0, 100));
}
