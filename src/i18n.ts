import { NextPage } from 'next';
import { createSharedPathnamesNavigation } from 'next-intl/navigation';
import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

export const locales = ['en', 'ru', 'pt'] as const;
export type Locale = (typeof locales)[number];

export type NextPageWithLocale = NextPage<{ params: { locale: Locale } }>;

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as any)) notFound();

  return {
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});

export const { Link, usePathname, useRouter, redirect } = createSharedPathnamesNavigation({ locales });
