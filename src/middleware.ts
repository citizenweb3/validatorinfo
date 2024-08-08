import { chain } from '@/middlewares/chain';
import withHeaders from '@/middlewares/withHeaders';
import withLocale from '@/middlewares/withLocale';

export default chain([withHeaders, withLocale]);

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|img).*)'],
};
