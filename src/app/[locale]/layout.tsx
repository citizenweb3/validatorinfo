import { NextIntlClientProvider } from 'next-intl';
import { getMessages, unstable_setRequestLocale } from 'next-intl/server';
import PlausibleProvider from 'next-plausible';
import { ThemeProvider } from 'next-themes';
import localFont from 'next/font/local';
import { ReactNode } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Footer from '@/components/footer';
import Header from '@/components/header/header';
import NavigationBar from '@/components/navigation-bar/navigation-bar';
import { WalletProviderComponent } from '@/context/WalletContext';
import { locales } from '@/i18n';

const sfpro = localFont({
  src: [
    {
      path: '../../../public/fonts/SFPRODISPLAYLIGHT.otf',
      weight: '300',
      style: 'light',
    },
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

const handjet = localFont({
  src: [
    {
      path: '../../../public/fonts/Handjet-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
  ],
  display: 'swap',
  variable: '--font-handjet',
});

const handjetLight = localFont({
  src: [
    {
      path: '../../../public/fonts/Handjet-Light.ttf',
      weight: '100',
      style: 'light',
    },
  ],
  display: 'swap',
  variable: '--font-handjet-light',
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: Readonly<{
  children: ReactNode;
  params: { locale: string };
}>) {
  unstable_setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${sfpro.variable} ${handjet.variable} ${handjetLight.variable}`} suppressHydrationWarning>
      <head>
        <title>Web3 Blockchain Validator, Mining Pool and Network Explorer</title>
        <meta
          name="description"
          content="Web3 Explorer. Blockchain Validator, Mining Pool and Network Interactive Dashboard, Real-Time Token Analytics and Metrics"
        />
        <meta
          name="keywords"
          content="validator info, multichain, validator, mining pool, explorer, staking, crypto, Web3, PoS, PoW, staking portfolio, delegators, miners, Proof of work, Proof of stake, Network governance, Blockchain networks, Token Information, Validator Comparison, Network Metrics, Validator Performance, Mining Pool Performance, Web3 Data, Blockchain Data, Staking rewards, Total value secured, Total value locked, Validator public good, Validator voting, Developer activity"
        />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:site" content="@therealvalinfo" />
        <PlausibleProvider domain="validatorinfo.com" />
        <link rel="canonical" href={'https://validatorinfo.com'} />
        <meta name="og:title" content="Web3 Blockchain Validator, Mining Pool and Network Explorer" />
        <meta
          name="og:description"
          content="Web3 Explorer. Blockchain Validator, Mining Pool and Network Interactive Dashboard, Real-Time Token Analytics and Metrics"
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={'https://validatorinfo.com'} />
        <meta property="og:image" content={'https://validatorinfo.com/img/logo.png'} />
        <meta property="og:image:width" content="512" />
        <meta property="og:image:height" content="512" />
        <meta property="og:image:alt" content="Validator Info" />
        <meta property="og:site_name" content="Validator Info" />
        <meta property="og:locale" content={locale} />
      </head>
      <body
        className={`${sfpro.className} min-h-screen overflow-x-hidden bg-background text-xs font-normal tracking-normal`}
      >
        <WalletProviderComponent>
          <ThemeProvider defaultTheme="dark" attribute="class">
            <NextIntlClientProvider messages={messages} locale={locale}>
              <div className="flex min-h-screen flex-col px-4">
                <Header />
                <div className="mt-4 flex flex-grow flex-row">
                  <NavigationBar />
                  <div className="ml-8 flex flex-grow">
                    <div className="flex w-full flex-col">
                      <div className="flex flex-grow flex-col">{children}</div>
                      <Footer />
                    </div>
                  </div>
                </div>
              </div>
            </NextIntlClientProvider>
            <ToastContainer
              className="!-right-1.5"
              toastClassName={'!bg-bgHover !border-r !border-t !border-bgSt !shadow-button !rounded-none'}
              bodyClassName={'text-base font-sfpro !px-2 !py-0 !m-0 text-white'}
              position="top-right"
              autoClose={2000}
              hideProgressBar
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="dark"
            />
          </ThemeProvider>
        </WalletProviderComponent>
      </body>
    </html>
  );
}
