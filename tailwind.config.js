/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        brand: {
          50: '#e6f5f1',
          100: '#b3e2d5',
          200: '#80cfb9',
          300: '#4dbc9d',
          400: '#2D8B75',
          500: '#24705f',
          600: '#1b5548',
          700: '#123a30',
          800: '#09201a',
          900: '#040d0a',
        },
        ochre: {
          400: '#C47335',
          500: '#a8612c',
        },
        gold: {
          400: '#D4A853',
          500: '#c49640',
        },
        danger: {
          400: '#E85D4A',
          500: '#d04a38',
        },
        surface: {
          900: '#0F1419',
          800: '#151D28',
          700: '#1A2332',
          600: '#212D3F',
          500: '#2A3750',
          400: '#344563',
          300: '#3E5576',
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', 'serif'],
        sans: ['"Noto Sans SC"', 'sans-serif'],
        mono: ['"DIN Alternate"', '"Roboto Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
