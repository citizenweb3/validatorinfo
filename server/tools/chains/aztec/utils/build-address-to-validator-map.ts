import db from '@/db';

export interface ValidatorInfo {
  id: number;
  moniker: string;
  url: string | null;
}

export type AddressToValidatorMap = Map<string, ValidatorInfo>;
export type ProposalVotingType = 'signals' | 'votes' | 'none';

export const buildAddressToValidatorMap = async (chainId: number): Promise<AddressToValidatorMap> => {
  const nodes = await db.node.findMany({
    where: { chainId },
    select: {
      operatorAddress: true,
      accountAddress: true,
      validator: {
        select: { id: true, moniker: true, url: true },
      },
    },
  });

  const addressToValidator = new Map<string, ValidatorInfo>();
  for (const node of nodes) {
    if (node.validator) {
      if (node.operatorAddress) {
        addressToValidator.set(node.operatorAddress.toLowerCase(), node.validator);
      }
      if (node.accountAddress) {
        addressToValidator.set(node.accountAddress.toLowerCase(), node.validator);
      }
    }
  }

  return addressToValidator;
};
