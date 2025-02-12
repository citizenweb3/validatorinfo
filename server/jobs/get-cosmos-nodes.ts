import logger from '@/logger';
import isUrlValid from '@/server/utils/is-url-valid';
import nodeService from '@/services/node-service';
import validatorService from '@/services/validator-service';

import { ChainWithNodes, Validator } from '../types';

const { logInfo, logError } = logger('cosmos-nodes');

const getData = async (url: string) => await fetch(url).then((data) => data.json());

const getCosmosNodes = async (chain: ChainWithNodes) => {
  const lcdUrl = chain.chainNodes.find((node) => node.type === 'lcd')?.url;
  if (!lcdUrl) throw new Error(`lcd node for ${chain.name} chain not found`);
  const validatorsUrl = `${lcdUrl}/cosmos/staking/v1beta1/validators?pagination.limit=10000&pagination.count_total=false`;

  try {
    logInfo(`Get validators for ${chain.name} - ${validatorsUrl}`);
    const validators: Validator[] = (await getData(validatorsUrl)).validators;

    validators.map(async (val: Validator) => {
      let validatorId: number | undefined;
      if (val.description.identity && val.description.identity.length === 16) {
        let website = val.description.website;
        if (website) {
          website =
            val.description.website.indexOf('http') === 0
              ? val.description.website
              : `https://${val.description.website}`;

          website = isUrlValid(website) ? website : '';
        }
        const validator = await validatorService.upsertValidator(val.description.identity, {
          moniker: val.description.moniker,
          website,
          securityContact: val.description.security_contact,
          details: val.description.details,
        });
        validatorId = validator.id;
      }

      await nodeService.upsertNode(chain, { ...val, validatorId });
    });
  } catch (e) {
    logError(`Can't fetch cosmos nodes: ${validatorsUrl}`, e);
  }
};

export default getCosmosNodes;
