/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff5f0',
          100: '#ffe8dc',
          500: '#ff6b35',
          600: '#e55a28',
          900: '#7c1d0a',
        },
      },
    },
  },
  plugins: [],
};
