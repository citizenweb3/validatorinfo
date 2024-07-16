import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

export async function GET(request: Request, { params }: { params: { chain: string } }) {
  const { chain } = params;
  const client = new PrismaClient()


  return Response.json(chain)
}
