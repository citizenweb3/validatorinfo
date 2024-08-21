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
      sfpro: ['var(--font-sfpro)', 'Arial', 'sans-serif'],
      hackernoon: ['var(--font-hackernoon)', 'Arial', 'sans-serif'],
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
      table_header: '#272727',
      background: 'var(--color-background)',
      bgSt: 'var(--color-background-stroke)',
      bgHover: 'var(--color-background-hover)',
    },
    extend: {
      backgroundImage: {
        cw3: `url('/img/icons/cw3.svg')`,
        cw3_h: `url('/img/icons/cw3-h.svg')`,
        github: `url('/img/icons/github.svg')`,
        github_h: `url('/img/icons/github-h.svg')`,
        x: `url('/img/icons/x.svg')`,
        x_h: `url('/img/icons/x-h.svg')`,
        search: `url('/img/icons/search.svg')`,
        search_h: `url('/img/icons/search-h.svg')`,
        hide: `url('/img/icons/navbar/hide.svg')`,
        hide_h: `url('/img/icons/navbar/hide-h.svg')`,
        hide_a: `url('/img/icons/navbar/hide-a.svg')`,
        info: `url('/img/icons/info.svg')`,
        info_h: `url('/img/icons/info-h.svg')`,
        info_a: `url('/img/icons/info-a.svg')`,
        close: `url('/img/icons/close.svg')`,
        close_h: `url('/img/icons/close-h.svg')`,
        close_a: `url('/img/icons/close-a.svg')`,
        plus: `url('/img/icons/plus.svg')`,
        plus_h: `url('/img/icons/plus-h.svg')`,
        plus_a: `url('/img/icons/plus-a.svg')`,
        triangle: `url('/img/icons/triangle.svg')`,
        triangle_h: `url('/img/icons/triangle-h.svg')`,
        triangle_a: `url('/img/icons/triangle-a.svg')`,
        triangle_w: `url('/img/icons/triangle_w.svg')`,
        triangle_w_h: `url('/img/icons/triangle_w-h.svg')`,
        triangle_w_a: `url('/img/icons/triangle_w-a.svg')`,
        sort: `url('/img/icons/sort-icon.svg')`,
        sort_h: `url('/img/icons/sort-icon-h.svg')`,
      },
      transitionProperty: {
        width: 'width',
      },
      boxShadow: {
        '3xl': '0 0 .5rem #E5C46B,0 0 .5rem #E5C46B,0 0 2rem #E5C46B',
        '2xl': '0 0 .25rem #E5C46B,0 0 .25rem #E5C46B,0 0 1rem #E5C46B',
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
