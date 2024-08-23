import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const client = new PrismaClient();

export async function GET(req: Request, ctx: any) {
  const chains = await client.$queryRaw`
  SELECT 
    moniker,
    identity,
    ARRAY_AGG("chainId"::TEXT) AS chainIds
  FROM 
    "Validator"
  GROUP BY 
    moniker, identity;`;

  return NextResponse.json(chains);
}
