import { NextRequest, NextResponse } from 'next/server';

import validatorService from '@/services/validator-service';

export async function GET(req: NextRequest) {
  try {
    const identity = req.nextUrl.searchParams.get('identity');

    if (!identity || identity.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query parameter "identity" is required and must be a non-empty string' },
        { status: 400 },
      );
    }

    const data = await validatorService.getByIdentityWithDetails(identity);

    if (!data) {
      return NextResponse.json({ error: 'Validator not found' }, { status: 404 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: 'Internal Server Error', detail: e?.message ?? 'unknown' }, { status: 500 });
  }
}
