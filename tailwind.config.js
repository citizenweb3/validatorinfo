/** @type {import('tailwindcss').Config} */

module.exports = {
  important: true,
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    container: {
      screens: {
        sm: '576px',
        md: '768px',
        lg: '992px',
        xl: '1200px',
      },
    },
    extend: {
      letterSpacing: {
        0.625: '.0625rem',
      },
      borderRadius: {
        5: '5px',
      },
      borderWidth: {
        0.5: '0.5px',
        2.5: '2.5px',
        3: '3px',
      },
      zIndex: {
        100: '100',
      },
      flex: {
        4: '0 0 33.333333%',
        5: '0 0 41.666667%',
        6: '0 0 50%',
        8: '0 0 66.666667%',
        9: '0 0 75%',
      },
      gap: {
        3.25: '13px',
        4.5: '18px',
        5.25: '21px',
        7.25: '29px',
        7.5: '30px',
        8.5: '34px',
      },
      inset: {
        '8/100': '8%',
        '9/100': '9%',
        '10/100': '10%',
        18: '4.5rem',
      },
      translate: {
        0: '0px',
        0.25: '0.075rem',
        px: '1px',
        '3/2': '150%',
      },
      padding: {
        0.25: '1.5px',
        0.75: '3px',
        1.25: '5px',
        2.75: '0.6875rem', //11px
        3.25: '13px',
        3.375: '13.5px',
        3.75: '15px',
        3.875: '15.5px',
        3.4: '16.5px',
        3.7: '0.975rem',
        4.25: '1rem',
        4.4: '1.125rem', //18px
        4.5: '1.15rem', //18.4px
        4.625: '1.175rem',
        4.75: '1.2rem',
        5.5: '1.375rem',
        5.75: '1.188rem',
        6.2: '1.563rem', //25px
        6.5: '1.625rem',
        6.75: '1.438rem',
        7.15: '1.781rem', //28.5px
        7.25: '1.8125rem', //29px
        7.5: '1.875rem', //30px
        8.5: '34px',
        9.5: '38px',
        10.25: '41px',
        11.25: '45px',
        11.5: '46px',
        13.25: '3.125rem', //50px
        13: '3.25rem', //52px
        18.5: '4.813rem', //77px
        72: '72px',
        15: '15px',
      },
      margin: {
        15: '15px',
        0.25: '1.5px',
        2.75: '0.6875rem',
        3.75: '15px',
        4.5: '18px',
        4.75: '19px',
        5.5: '22px',
        7.5: '30px',
        13.25: '3.125rem', //50px
        13: '3.25rem', //52px
        15.5: '3.875rem',
        17: '68px',
        62.5: '15.625rem',
        64: '15.5rem',
        68: '17rem',
      },
      width: {
        4.25: '1.0625rem', //17px
        4.5: '1.125rem',
        9.5: '2.125rem', //34px
        9.85: '2.375rem', //38px
        11.75: '2.9375rem',
        12.5: '3.15rem',
        13: '3.275rem',
        13.5: '3.275rem',
        15: '3.75rem',
        15.5: '3.875rem',
        17: '68px',
        62: '15.5rem',
        62.5: '15.625rem',
        63: '15.75rem',
        68: '17rem',
        73: '17.75rem',
        73.5: '18rem',
        73.625: '18.125rem',
        73.75: '18.25rem',
        74: '18.5rem',
        76: '19rem',
        82: '20.5rem',
        84: '21rem',
        88: '22rem',
        95: '23.75rem', //380px
        98: '26rem',
        100: '28rem',
        '97/100': '97%',
        messBox: '100% -30px',
        '45/100': '45%',
        '15/100': '15%',
        '85/100': '85%',
        full: '100%',
      },
      maxWidth: {
        '.25xl': '33.75rem', //540px
        '1.5xl': '37.5rem', //600px
        '2.625xl': '45rem', //720px
        '4.5xl': '60rem', //960px
        '5.75xl': '71.25rem', //1140px
        '1/3': '33.333333%',
        '5/12': '41.666667%',
        '1/2': '50%',
        '7/12': '58.333333%',
        '9/12': '75%',
        '2/3': '66.666667%',
        600: '600px',
      },
      height: {
        0.75: '0.188rem', //3px
        1.25: '0.313rem', //5px
        4.25: '1.0625rem', //17px
        4.5: '1.125rem',
        6.2: '1.563rem', //25px
        7.5: '30px',
        9.5: '2.125rem', //34px
        9.85: '2.375rem', //38px
        10.5: '2.625rem',
        10.75: '2.6875rem',
        11.25: '2.813rem', //45px
        11.5: '2.875rem', //46px
        11.75: '2.937rem',
        12.5: '3.15rem', //50.4px
        12.6: '3.188rem', //51px,
        13: '3.275rem',
        15: '3.75rem',
        17: '4.25rem',
        18: '4.5rem',
        19: '4.75rem',
        19.5: '4.875rem',
        19.75: '4.9375rem',
        20.5: '5.125rem',
        21: '5.25rem',
        22: '5.5rem',
        38: '9.375rem', //150px
        83: '21.875rem', //350px
      },
      colors: {
        default: 'rgb(23 43 77)', //#172b4d
        blue: {
          60: 'rgb(246 249 252)',
          410: 'rgb(17 113 239)',
        },
        cyan: {
          30: 'rgb(233 236 239)',
          310: 'rgb(55 213 242)',
          320: 'rgb(34 209 240)',
        },
        normal: 'rgb(82 95 127)',
        gray: {
          210: 'rgb(173 181 189)', //#adb5bd
          410: 'rgb(57 63 73)', //#393f49
        },
        dark: {
          DEFAULT: 'rgb(23 43 77)', //#172b4d
          light: 'rgb(28 52 93)',
          lighter: 'rgb(82 95 127)', //#525f7f
          4: 'rgb(0 0 0 / 0.05)', // #0000000d
          10: 'rgb(0 0 0 / 0.2)',
          20: 'rgb(0 0 0 / 0.6)', // #00000099
          50: 'rgb(0 0 0 / 0.95)', //#000000f2
          100: 'rgb(26 23 77)', // #1a174d
          120: 'rgb(11 21 38)', //
        },
        light: {
          DEFAULT: 'rgb(206 212 218)', //#ced4da
          10: 'rgb(233 236 239)', //#e9ecef
        },
        primary: {
          DEFAULT: 'rgb(50 76 221)',
          dark: 'rgb(50 50 93)',
          white: 'rgb(0 0 0 / 0.05)',
        },
        muted: {
          DEFAULT: 'rgb(136 152 170)',
        },
        secondary: {
          DEFAULT: 'rgb(247 250 252)',
          text: 'rgb(67 133 177)',
          active: 'rgb(210 227 238)',
        },
        info: {
          DEFAULT: 'rgb(17 205 239)',
          active: 'rgb(13 165 192)',
        },
        warning: {
          DEFAULT: 'rgb(251 99 64)',
          active: 'rgb(250 58 14)',
          50: 'rgb(252 124 95)', //#fc7c5f
        },
        success: {
          DEFAULT: 'rgb(45 206 137)',
          active: 'rgb(36 164 109)',
          50: 'rgb(79 214 156)', //#4fd69c
        },
        danger: {
          DEFAULT: 'rgb(245 54 92)',
          active: 'rgb(236 12 56)',
          50: 'rgb(247 86 118)', //#f75676
        },
        webkit: {
          DEFAULT: '-webkit-focus-ring-color',
        },
        amber: {
          60: 'rgb(252 248 227)',
        },
        slate: {
          10: 'rgb(255 255 255 / 0.6)',
          20: 'rgb(248 249 254)', //#f8f9fe
        },
        red: {
          410: 'rgb(244 100 95)',
          light: 'rgb(245 96 54)',
        },
        indigo: {
          210: 'rgb(50 50 93)', //#32325d
          410: 'rgb(94 114 228)', //#5e72e4
          450: 'rgb(130 94 228)', //#825ee4
        },
        yellow: {
          310: 'rgb(255 214 0)',
        },
        eerieBlack: '#1E1E1E',
        blackOlive: '#3E3E3E',
        lust: '#EB1616',
        apple: '#4FB848',
        americanYellow: '#F3B101',
        white: '#FFFFFF',
        orange: '#EC9503',
      },
      fontSize: {
        0.625: ['0.625rem', '1.5'],
        0.65: ['0.65rem', '1.5'],
        0.8125: ['0.8125rem', '1.5'],
        0.813: ['0.813rem', '1.5'], //13px
        0.9375: ['0.9375rem', '1.5'],
        0.95: ['0.95rem', '1.5'],
        1.0625: ['1.0625rem', '1.5'],
        1.1: ['1.1rem', '1.5'],
        1.375: ['1.375rem', '1.5'],
        1.6: ['1.6rem', '1.5'],
        1.625: ['1.625rem', '1.5'],
        1.6275: ['1.6275rem', '1.5'],
        1.7: ['1.7rem', '1.5'],
        2.1875: ['2.1875rem', '1.5'],
        2.75: ['2.75rem', '1.5'], //44px
        3.3: ['3.3rem', '1.5'],
        90: ['90%', '1.5'],
        80: ['80%', '1.5'],
        70: ['70%', '1.5'],
        60: ['60%', '1.5'],
        sm: ['.875rem', '1.5'],
        12.8: ['12.8px', '1.5'],
        15: ['15px', '1.5'],
        17: ['17px', '1.5'],
        20: ['20px'],
        h1: ['34px'],
        h2: ['24px'],
        h3: ['19px'],
        h4: ['16px'],
        h5: ['13px'],
        h6: ['11px'],
      },
      lineHeight: {
        1.6: '1.6',
        1.7: '1.7',
        7.5: '30px',
      },
      boxShadow: {
        light: '0 0 0 1px rgb(0 0 0 / 10%)',
        medium: '0 0 0 1px rgb(0 0 0 / 10%), 0 4px 16px rgb(0 0 0 / 10%)',
        card: '0 0 2rem 0 rgba(136, 152, 170, 0.15)',
        button: '0 4px 6px rgb(50, 50, 93, 0.11), 0 1px 3px rgb(0, 0, 0 , 0.08)',
        'form-input': '0 1px 3px rgb(50, 50, 93, 0.15), 0 1px 0 rgb(0, 0, 0, 0.08)',
        gold: '0 0 10px rgb(243,177,1)',
      },
    },
    fontFamily: {
      main: ['"DotGothic16"'],
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
