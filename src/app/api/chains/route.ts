import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const client = new PrismaClient();

export async function GET(req: Request, ctx: any) {
  const chains = await client.chain.findMany({ include: { github: true } });

  return NextResponse.json(chains);
}
