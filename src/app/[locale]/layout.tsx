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
    <html lang={locale} className={`${sfpro.variable} ${handjet.variable}`}>
      <head>
        <title>
          ValidatorInfo: Validator & Mining Pool Information - Explore the Multichain Network Landscape of Web3
        </title>
        <meta
          name="description"
          content="ValidatorInfo - a multichain explorer and dashboard, with simple UI and gamification. Free web3 application, providing analytics and real-time metrics on networks, validators, mining pools and tokens."
        />
        <meta
          name="keywords"
          content="validator info, multichain, validator, mining pool, explorer, staking, crypto, Web3, PoS, PoW, staking portfolio, delegators, miners, Proof of work, Proof of stake, Network governance, Blockchain networks, Token Information, Validator Comparison, Network Metrics, Validator Performance, Mining Pool Performance, Web3 Data, Blockchain Data, Staking rewards, Total value secured, Total value locked, Validator public good, Validator voting, Developer activity"
        />
        <PlausibleProvider domain="validatorinfo.com" />
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
