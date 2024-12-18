import { unstable_setRequestLocale } from 'next-intl/server';

import { Locale, redirect } from '@/i18n';

export default async function Lucky({ params: { locale } }: { params: { locale: Locale } }) {
  unstable_setRequestLocale(locale);
  const random = Math.floor(Math.random() * 1000) + 1;
  redirect(`/validators/${random}`);
}
