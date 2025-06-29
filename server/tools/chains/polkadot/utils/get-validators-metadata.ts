import type { Option } from '@polkadot/types';
import { connectWsApi } from '@/server/tools/chains/polkadot/utils/connect-ws-api';
import logger from '@/logger';

const { logError } = logger('polkadot-validator-stake');

type MetadataField = { Raw: string } | { Hashed: string } | 'None' | null | string;

interface HumanMetadataInfo {
  display: MetadataField;
  legal: MetadataField;
  web: MetadataField;
  matrix: MetadataField;
  email: MetadataField;
  pgpFingerprint: MetadataField;
  image: MetadataField;
  twitter: MetadataField;
  github: MetadataField;
  discord: MetadataField;

  [key: string]: MetadataField;
}

const unpackIdentityInfo = (info: HumanMetadataInfo): Record<string, string | null> => {
  const unpacked: Record<string, any> = {};
  for (const [key, value] of Object.entries(info)) {
    if (value && typeof value === 'object' && 'Raw' in value) {
      unpacked[key] = value.Raw;
    } else {
      unpacked[key] = value;
    }
  }
  return unpacked;
};

export const getValidatorMetadata = async () => {
  const wsList = ['wss://polkadot-people-rpc.polkadot.io'];
  const api = await connectWsApi(wsList, 3);

  try {
    const entries = await api.query.identity.identityOf.entries();
    const validatorInfo: { address: string; info: Record<string, any> }[] = [];
    for (const [key, opt] of entries) {
      const identityOption = opt as Option<any>;
      if (identityOption.isSome) {
        const address = key.args[0].toString();
        const human = identityOption.unwrap().toHuman() as { info: HumanMetadataInfo };
        const unpackedInfo = unpackIdentityInfo(human.info);
        validatorInfo.push({
          address,
          info: unpackedInfo,
        });
      }
    }
    await api.disconnect();
    return validatorInfo;
  } catch (error) {
    logError(`Error fetching validator metadata for ${wsList}`);
    return [];
  }
};
