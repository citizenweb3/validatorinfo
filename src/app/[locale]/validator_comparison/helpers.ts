import { ValidatorData, ValidatorDataFilled } from '@/app/validator_comparison/get-validator-data';

const fieldsToChange: (keyof ValidatorData)[] = [
  'healthChange',
  'technicalScoreChanges',
  'TVSGovernanceScoreChanges',
  'userScoreChanges',
  'socialScoreChanges',
  'badges',
  'reviews',
  'tagsInTheWild',
] as const;

const topAndBottom = (validators: ValidatorData[], field: string): { top: number; bottom: number } => {
  // @ts-ignore
  const sorted = [...validators].sort((a, b) => a[field] - b[field]);
  const top = sorted[sorted.length - 1];
  const bottom = sorted[0];
  // @ts-ignore
  return { top: top[field], bottom: bottom[field] };
};

export const fillColors = (validators: ValidatorData[]) => {
  const filled: ValidatorDataFilled[] = [];
  if (!validators.length) return filled;

  const topAndBottomValues = fieldsToChange.map((field) => topAndBottom(validators, field));

  for (const validator of validators) {
    const filledFields: Record<string, { value: number; color: string }> = {};
    fieldsToChange.forEach((field, index) => {
      const value: number = validator[field] as number;
      const { top, bottom } = topAndBottomValues[index];
      const color = value === top ? 'secondary' : value === bottom ? 'red' : 'highlight';
      filledFields[field] = { value, color };
    });

    // @ts-ignore
    filled.push({
      moniker: validator.moniker,
      id: validator.id,
      TVSGrowth: validator.TVSGrowth,
      fanGrowth: validator.fanGrowth,
      ...filledFields,
    });
  }

  return filled;
};
