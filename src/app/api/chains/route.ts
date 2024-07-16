import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

const client = new PrismaClient();



export async function GET(req: NextApiRequest) {
  const networks = await client.chain.findMany({ include: { lcdNodes: true, rpcNodes: true, grpc: true, wsNodes: true, github: true } });
  return Response.json(networks)
}
