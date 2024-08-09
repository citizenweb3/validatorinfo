import { NextIntlClientProvider } from 'next-intl';
import { getMessages, unstable_setRequestLocale } from 'next-intl/server';
import PlausibleProvider from 'next-plausible';
import { ThemeProvider } from 'next-themes';
import localFont from 'next/font/local';

import Footer from '@/components/footer';
import Header from '@/components/header/header';
import NavigationBar from '@/components/navigation-bar/navigation-bar';
import PreloadedIcons from '@/components/preloaded-icons';
import { locales } from '@/i18n';

const sfpro = localFont({
  src: [
    {
      path: '../../../public/fonts/SFPRODISPLAYREGULAR.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../../public/fonts/SFPRODISPLAYBOLD.otf',
      weight: '700',
      style: 'bold',
    },
  ],
  variable: '--font-sfpro',
});

const hackerNoon = localFont({
  src: '../../../public/fonts/HackerNoonV1-Regular.ttf',
  display: 'swap',
  variable: '--font-hackernoon',
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  unstable_setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${sfpro.variable} ${hackerNoon.variable}`}>
      <head>
        <title>ValidatorInfo</title>
        <PlausibleProvider domain="validatorinfo.com" />
      </head>
      <body
        className={`${sfpro.className} min-h-screen overflow-x-hidden bg-background text-xs font-normal tracking-normal`}
      >
        <ThemeProvider defaultTheme="dark" attribute="class">
          <PreloadedIcons />
          <NextIntlClientProvider messages={messages} locale={locale}>
            <div className="flex min-h-screen flex-col px-4">
              <Header />
              <div className="mt-4 flex flex-grow flex-row">
                <NavigationBar />
                <div className="ml-8 flex flex-grow">
                  <div className="w-full">
                    <div>{children}</div>
                  </div>
                </div>
              </div>
              <Footer />
            </div>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
