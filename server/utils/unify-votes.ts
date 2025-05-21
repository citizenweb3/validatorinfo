import { VoteOption } from '@prisma/client';

export function unifyVotes(vote: string | undefined | null): VoteOption {
  if (!vote) return 'UNSPECIFIED';

  const value = vote.toLowerCase().trim();

  if (['yes', 'yay'].includes(value)) return 'YES';
  if (['no', 'nay'].includes(value)) return 'NO';
  if (['abstain', 'abs'].includes(value)) return 'ABSTAIN';
  if (['veto', 'no_with_veto'].includes(value)) return 'VETO';

  return 'UNSPECIFIED';
}
