// @ts-ignore
import tailwindScrollbar from 'tailwind-scrollbar';
import type { Config } from 'tailwindcss';
import colors from 'tailwindcss/colors';
import defaultConfig from 'tailwindcss/defaultConfig';
import plugin from 'tailwindcss/plugin';

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
      handjet: ['var(--font-handjet)', 'Arial', 'sans-serif'],
    },
    letterSpacing: {
      none: '0',
      normal: '.2em',
      wide: '.3em',
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
      ...defaultConfig.theme?.fontSize,
      xs: '0.672rem',
      sm: '0.83rem',
      lg: '1.172rem',
      xl: '1.5rem',
    },
    colors: {
      transparent: colors.transparent,
      black: colors.black,
      white: colors.white,
      red: '#EB1616',
      primary: '#3E3E3E',
      secondary: '#4FB848',
      highlight: 'var(--color-background-highlight)',
      table_header: '#272727',
      card: '#272727',
      background: 'var(--color-background)',
      bgSt: 'var(--color-background-stroke)',
      bgHover: 'var(--color-background-hover)',
      oldPalette: {
        yellow: '#F3B101',
        red: '#EB1616',
        green: '#4FB848',
        white: '#FFFFFFE5',
      },
    },
    extend: {
      backgroundImage: {
        cw3: `url('/img/icons/cw3.png')`,
        cw3_h: `url('/img/icons/cw3-h.png')`,
        github: `url('/img/icons/github.png')`,
        github_h: `url('/img/icons/github-h.png')`,
        x: `url('/img/icons/x.png')`,
        x_h: `url('/img/icons/x-h.png')`,
        facebook: `url('/img/icons/facebook.png')`,
        facebook_h: `url('/img/icons/facebook-h.png')`,
        tg: `url('/img/icons/tg.png')`,
        tg_h: `url('/img/icons/tg-h.png')`,
        reddit: `url('/img/icons/reddit.png')`,
        reddit_h: `url('/img/icons/reddit-h.png')`,
        blog: `url('/img/icons/blog.png')`,
        blog_h: `url('/img/icons/blog-h.png')`,
        search: `url('/img/icons/search.png')`,
        search_h: `url('/img/icons/search-h.png')`,
        hide: `url('/img/icons/navbar/hide.png')`,
        hide_h: `url('/img/icons/navbar/hide-h.png')`,
        hide_a: `url('/img/icons/navbar/hide-a.png')`,
        close: `url('/img/icons/close.png')`,
        close_h: `url('/img/icons/close-h.png')`,
        close_a: `url('/img/icons/close-a.png')`,
        plus: `url('/img/icons/plus.png')`,
        plus_h: `url('/img/icons/plus-h.png')`,
        plus_a: `url('/img/icons/plus-a.png')`,
        triangle: `url('/img/icons/triangle.png')`,
        triangle_h: `url('/img/icons/triangle-h.png')`,
        triangle_a: `url('/img/icons/triangle-a.png')`,
        triangle_w: `url('/img/icons/triangle_w.svg')`,
        triangle_w_h: `url('/img/icons/triangle_w-h.svg')`,
        triangle_w_a: `url('/img/icons/triangle_w-a.svg')`,
        sort: `url('/img/icons/sort-icon.png')`,
        sort_a: `url('/img/icons/sort-icon-a.png')`,
        sort_h: `url('/img/icons/sort-icon-h.png')`,
        star: `url('/img/icons/star.png')`,
        star_h: `url('/img/icons/star-h.png')`,
        web: `url('/img/icons/web.png')`,
        web_h: `url('/img/icons/web-h.png')`,
        go_big: `url('/img/icons/go-big.png')`,
        go_big_h: `url('/img/icons/go-big-h.png')`,
        go_big_a: `url('/img/icons/go-big-a.png')`,
        eco: `url('/img/icons/merits/eco.svg')`,
        eco_h: `url('/img/icons/merits/eco-h.svg')`,
        keyhole: `url('/img/icons/merits/keyhole.svg')`,
        keyhole_h: `url('/img/icons/merits/keyhole-h.svg')`,
        github_g: `url('/img/icons/merits/github-gold.svg')`,
        approved: `url('/img/icons/approved.png')`,
        approved_h: `url('/img/icons/approved-h.png')`,
        approved_a: `url('/img/icons/approved-a.png')`,
        disapproved: `url('/img/icons/disapproved.png')`,
        disapproved_h: `url('/img/icons/disapproved-h.png')`,
        disapproved_a: `url('/img/icons/disapproved-a.png')`,
      },
      textShadow: {
        sm: '1px 1px 0 var(--tw-shadow-color)',
        DEFAULT: '0 2px 4px var(--tw-shadow-color)',
        lg: '0 8px 16px var(--tw-shadow-color)',
      },
      transitionProperty: {
        width: 'width',
      },
      boxShadow: {
        chat: '0 0 .125rem #000,0 0 .125rem #000,0 .125rem 0.25rem #000',
        '3xl': '0 0 .5rem #000,0 0 .5rem #000,0 0 2rem #000',
        '2xl': '0 0 .25rem #E5C46B,0 0 .25rem #E5C46B,0 0 1rem #E5C46B',
        button: '0 0 .125rem #000,0 0 .125rem #000,0 .5rem .5rem #000',
        'button-highlight': '0 0 .125rem #3E3E3E,0 0 .125rem #3E3E3E,0 .5rem .5rem #3E3E3E',
        'button-greenlight': '0 0 .125rem #4FB848,0 0 .125rem #4FB848,0 .5rem .5rem #4FB848',
        line: '0 0 .125rem #000,0 .25rem .125rem #000,0 .5rem .5rem #000',
      },
      charts: {
        width: '290px',
        doughnut: {
          labels: {
            width: 25,
            height: 25,
          },
        },
      },
    },
  },
  plugins: [
    tailwindScrollbar({}),
    plugin(function ({ matchUtilities, theme }) {
      matchUtilities(
        {
          'text-shadow': (value) => ({
            textShadow: value,
          }),
        },
        { values: theme('textShadow') },
      );
    }),
  ],
};
export default config;
