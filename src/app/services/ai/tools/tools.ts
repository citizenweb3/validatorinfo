import { chainTools } from './chain-tools';
import { validatorTools } from './validator-tools';
import { governanceTools } from './governance-tools';
import { marketTools } from './market-tools';
import { explainTools } from './explain-tools';

export const aiTools = {
  ...chainTools,
  ...validatorTools,
  ...governanceTools,
  ...marketTools,
  ...explainTools,
};
