import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        milin: {
          // Hot pink/Magenta palette for Milin Shop luxury brand
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f8a5d8',
          400: '#f472b6', // Primary hot pink
          500: '#ec4899', // Brand pink
          600: '#db2777',
          700: '#be205d',
          800: '#9d174d', // Deep magenta
          900: '#831843',
        },
        rose: {
          50: '#fff7ed',
          100: '#ffe4db',
          200: '#ffd4c4',
          300: '#ffb3a6',
          400: '#ff9988',
          500: '#ff7a6b',
          600: '#ff5c4d',
          700: '#ff3d2e',
          800: '#e01b1b',
          900: '#c80000',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
