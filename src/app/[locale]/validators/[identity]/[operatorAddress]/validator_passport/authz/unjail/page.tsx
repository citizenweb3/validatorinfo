import { getTranslations } from 'next-intl/server';

import { Locale, NextPageWithLocale } from '@/i18n';

interface PageProps {}

const PassportUnjailPage: NextPageWithLocale<PageProps> = async ({ params: { locale } }) => {
  const t = await getTranslations({ locale, namespace: 'ValidatorPassportPage' });
  const labelStyle = 'text-base text-highlight';
  const valueStyle = 'text-base pb-3';
  const linkStyle = 'text-base pb-3 underline underline-offset-2 cursor-pointer'

  return (
    <div className="pt-2 pl-2">
      <div className={labelStyle}>Granter:</div>
      <div className={linkStyle}>bcn1n9a14td3qlgcw7f1kjdhzh7x0vl2ret7a7z7d</div>
      <div className={labelStyle}>Grantee:</div>
      <div className={linkStyle}>bcan10xwwdhzeg92vyahkvza72yuo3w4qnscrw8v</div>
      <div className={labelStyle}>Authorization:</div>
      <div className={valueStyle}>Generic Authorization</div>
      <div className={labelStyle}> @Type:</div>
      <div className={valueStyle}>/cosmos.authz.v1beta1.GenericAuthorization</div>
      <div className={labelStyle}>Msg:</div>
      <div className={valueStyle}>/cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission</div>
      <div className={labelStyle}>Expiration:</div>
      <div className={valueStyle}>May 22nd 2024, 16:07:33</div>
    </div>
  );
};

export default PassportUnjailPage;
