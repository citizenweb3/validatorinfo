import createMiddleware from 'next-intl/middleware';
import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';

import { locales } from '@/i18n';
import { CustomMiddleware } from '@/middlewares/chain';

const withLocale = (middleware: CustomMiddleware): CustomMiddleware => {
  return async (request: NextRequest, event: NextFetchEvent, response: NextResponse) => {
    const locale = createMiddleware({
      locales,
      defaultLocale: 'en',
      localePrefix: 'never',
    });

    return middleware(request, event, locale(request));
  };
};

export default withLocale;
