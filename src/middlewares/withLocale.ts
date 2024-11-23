import createMiddleware from 'next-intl/middleware';
import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';

import { Locale, locales } from '@/i18n';
import { CustomMiddleware } from '@/middlewares/chain';

const withLocale = (middleware: CustomMiddleware): CustomMiddleware => {
  return async (request: NextRequest, event: NextFetchEvent, response: NextResponse) => {
    const defaultLocale = (request.cookies.get('NEXT_LOCALE')?.value || 'en') as Locale;

    const locale = createMiddleware({
      locales,
      defaultLocale,
      localePrefix: 'never',
      localeDetection: false,
    });

    return middleware(request, event, locale(request));
  };
};

export default withLocale;
