/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"Space Mono"', 'monospace'],
      },
      colors: {
        cyan: {
          400: '#2dedc8',
          500: '#22c3a6',
        },
      },
    },
  },
  plugins: [],
};