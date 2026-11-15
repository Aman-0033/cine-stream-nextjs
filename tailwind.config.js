/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'jet-black': '#0A0A0A',
        'cerulean': {
          DEFAULT: '#007BA7',
          light: '#00A3DF',
          dark: '#005877',
        },
        'neon-rose': {
          DEFAULT: '#FF2D95',
          light: '#FF64B4',
          dark: '#D1006E',
        },
        // Semantic design system aliases
        base: '#0A0A0A',
        primary: '#007BA7',
        secondary: '#FF2D95',
        heading: '#FFFFFF',
        metadata: '#CBD5E1', // slate-300
      },
      fontFamily: {
        sans: ['Arial', 'Helvetica', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
