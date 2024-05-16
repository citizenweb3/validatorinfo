import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import { DotGothic16 } from 'next/font/google';
import localFont from 'next/font/local';

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
      <body className={`${squarified.className} mx-10 bg-background text-xs tracking-widest`}>
        <ThemeProvider defaultTheme="dark" attribute="class">
          <Header />
          <div className="mt-4 flex flex-row">
            <NavigationBar />
            <div className="ml-8 flex flex-grow">{children}</div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
