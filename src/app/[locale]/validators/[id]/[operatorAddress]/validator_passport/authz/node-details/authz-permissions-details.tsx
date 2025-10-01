import Link from 'next/link';
import { FC } from 'react';

import { validatorNodesWithChainData } from '@/services/validator-service';

interface OwnProps {
  permissions: {
    granter: string;
    grantee: string;
    authorization: string;
    type: string;
    msg: string;
    expiration: string;
  };
  node?: validatorNodesWithChainData | undefined;
}

const AuthzPermissionsDetails: FC<OwnProps> = ({ permissions, node }) => {
  const labelStyle = 'text-base text-highlight';
  const valueStyle = 'text-base pb-3';
  const linkStyle = 'text-base pb-3 underline underline-offset-2 cursor-pointer';

  return (
    <div className="pl-2 pt-2">
      <div className={labelStyle}>Granter:</div>
      <Link className={linkStyle} href={`/networks/${node?.chain.name}/address/${permissions.granter}/passport`}>
        {permissions.granter}
      </Link>
      <div className={labelStyle}>Grantee:</div>
      <Link className={linkStyle} href={`/networks/${node?.chain.name}/address/${permissions.grantee}/passport`}>
        {permissions.grantee}
      </Link>
      <div className={labelStyle}>Authorization:</div>
      <div className={valueStyle}>{permissions.authorization}</div>
      <div className={labelStyle}> @Type:</div>
      <div className={valueStyle}>{permissions.type}</div>
      <div className={labelStyle}>Msg:</div>
      <div className={valueStyle}>{permissions.msg}</div>
      <div className={labelStyle}>Expiration:</div>
      <div className={valueStyle}>{permissions.expiration}</div>
    </div>
  );
};

export default AuthzPermissionsDetails;
