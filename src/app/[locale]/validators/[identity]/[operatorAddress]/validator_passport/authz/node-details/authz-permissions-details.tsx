'use client';

import { FC, useEffect } from 'react';

interface OwnProps {
  url: string | null;
  permissions: {
    granter: string;
    grantee: string;
    authorization: string;
    type: string;
    msg: string;
    expiration: string;
  };
}

const AuthzPermissionsDetails: FC<OwnProps> = ({ url, permissions }) => {
  useEffect(() => {
    if (url && !url.includes('/validator_passport/authz/')) {
      window.scrollTo({
        top: 0,
      });
    }
  }, [url]);

  const labelStyle = 'text-base text-highlight';
  const valueStyle = 'text-base pb-3';
  const linkStyle = 'text-base pb-3 underline underline-offset-2 cursor-pointer';

  return (
    <div className="pl-2 pt-2">
      <div className={labelStyle}>Granter:</div>
      <div className={linkStyle}>{permissions.granter}</div>
      <div className={labelStyle}>Grantee:</div>
      <div className={linkStyle}>{permissions.grantee}</div>
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
