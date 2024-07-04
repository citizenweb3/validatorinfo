import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import { DotGothic16 } from 'next/font/google';
import localFont from 'next/font/local';

import Footer from '@/components/footer';
import Header from '@/components/header/header';
import NavigationBar from '@/components/navigation-bar/navigation-bar';

import './globals.css';

const dotGothic = DotGothic16({
  variable: '--font-gothic',
  display: 'swap',
  weight: ['400'],
  subsets: ['latin'],
});

const squarified = localFont({
  src: '../../public/fonts/squarified.ttf',
  display: 'swap',
  variable: '--font-squarified',
});

const retroGaming = localFont({
  src: '../../public/fonts/retro-gaming.ttf',
  display: 'swap',
  variable: '--font-retro',
});

export const metadata: Metadata = {
  title: 'ValidatorInfo',
  description: 'Validator info',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${squarified.variable} ${retroGaming.variable} ${dotGothic.variable}`}>
      <body
        className={`${squarified.className} min-h-screen w-screen overflow-x-hidden bg-background px-4 text-xs tracking-normal`}
      >
        <ThemeProvider defaultTheme="dark" attribute="class">
          <div className="flex min-h-screen flex-col">
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
        </ThemeProvider>
      </body>
    </html>
  );
}
