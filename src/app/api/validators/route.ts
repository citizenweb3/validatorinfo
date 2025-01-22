import { NextResponse } from 'next/server';

import ValidatorService from '@/services/validator-service';

export async function GET(req: Request, ctx: any) {
  return NextResponse.json(await ValidatorService.getAll([], 0, 100));
}
