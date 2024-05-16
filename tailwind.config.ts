// @ts-ignore
import tailwindScrollbar from 'tailwind-scrollbar';
import type { Config } from 'tailwindcss';
import colors from 'tailwindcss/colors';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    fontFamily: {
      squarified: ['var(--font-squarified)', 'Arial', 'sans-serif'],
      retro: ['var(--font-retro)', 'Arial', 'sans-serif'],
      gothic: ['var(--font-gothic)', 'Arial', 'sans-serif'],
    },
    screens: {
      xs: '320px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    fontSize: {
      xs: '0.672rem',
      sm: '0.83rem',
      base: '1rem',
      lg: '1.172rem',
      xl: '1.5rem',
      '2xl': '2.125rem',
    },
    colors: {
      transparent: colors.transparent,
      black: colors.black,
      white: colors.white,
      primary: '#EB1616',
      secondary: '#4FB848',
      highlight: '#F3B101',
      background: 'var(--color-background)',
      bgSt: 'var(--color-background-stroke)',
    },
    extend: {
      boxShadow: {
        '3xl': '0 0 .5rem #F3B101,0 0 .5rem #F3B101,0 0 2rem #F3B101',
      },
    },
  },
  plugins: [tailwindScrollbar({})],
};
export default config;
