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
    letterSpacing: {
      normal: '.2em',
    },
    screens: {
      '2xs': '480px',
      xs: '580px',
      sm: '768px',
      md: '950px',
      lg: '1140px',
      xl: '1330px',
      '2xl': '1515px',
    },
    fontSize: {
      xs: '0.672rem',
      sm: '0.83rem',
      base: '1rem',
      lg: '1.172rem',
      xl: '1.5rem',
      '2xl': '2.125rem',
      '3xl': '2.75rem',
      '4xl': '4rem',
    },
    colors: {
      transparent: colors.transparent,
      black: colors.black,
      white: colors.white,
      red: '#EB1616',
      primary: '#3E3E3E',
      secondary: '#4FB848',
      highlight: '#E5C46B',
      background: 'var(--color-background)',
      bgSt: 'var(--color-background-stroke)',
    },
    extend: {
      transitionProperty: {
        width: 'width',
      },
      boxShadow: {
        '3xl': '0 0 .5rem #E5C46B,0 0 .5rem #E5C46B,0 0 2rem #E5C46B',
        button: '0 0 .125rem #000,0 0 .125rem #000,0 .5rem .5rem #000',
        'button-highlight': '0 0 .125rem #3E3E3E,0 0 .125rem #3E3E3E,0 .5rem .5rem #3E3E3E',
        'button-greenlight': '0 0 .125rem #4FB848,0 0 .125rem #4FB848,0 .5rem .5rem #4FB848',
        line: '0 0 .125rem #000,0 .25rem .125rem #000,0 .5rem .5rem #000',
      },
    },
  },
  plugins: [tailwindScrollbar({})],
};
export default config;
