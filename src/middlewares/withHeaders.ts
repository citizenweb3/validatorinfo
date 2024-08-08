import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';

import { CustomMiddleware } from './chain';

const withHeaders = (middleware: CustomMiddleware): CustomMiddleware => {
  return async (request: NextRequest, event: NextFetchEvent, response: NextResponse) => {
    const headers = new Headers(request.headers);
    headers.set('x-current-path', request.nextUrl.pathname);
    headers.set('x-current-search', request.nextUrl.search);
    NextResponse.next({ headers });

    return middleware(request, event, response);
  };
};

export default withHeaders;
