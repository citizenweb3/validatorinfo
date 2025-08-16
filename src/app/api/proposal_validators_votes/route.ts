import { NextRequest, NextResponse } from 'next/server';
import voteService from '@/services/vote-service';

export async function GET(req: NextRequest) {
  const chainId = Number(req.nextUrl.searchParams.get('chainId'));
  const proposalId = req.nextUrl.searchParams.get('proposalId')!;
  const q = (req.nextUrl.searchParams.get('q') ?? '').toLowerCase();

  const { votes } = await voteService.getProposalValidatorsVotes(
    chainId, proposalId, 0, Number.MAX_SAFE_INTEGER, 'moniker', 'asc', 'all',
  );

  const validators = votes
    .filter((v) => v.validator.moniker.toLowerCase().includes(q))
    .map((v) => ({
      id: v.validator.id,
      moniker: v.validator.moniker,
      url: v.validator.iconUrl,
      vote: v.vote ?? '–',
    }));

  return NextResponse.json({ validators });
}