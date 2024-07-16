import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

export async function GET(request: Request, { params }: { params: { chain: string } }) {
  const { chain } = params;
  const client = new PrismaClient();
  const dbResponse = await client.chain.findFirst({ where: { name: chain } });
  return Response.json(dbResponse);
}
