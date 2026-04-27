import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          mint: '#4FD1C5',
          lilac: '#B794F4',
          peach: '#F6AD55',
          navy: '#2A4365'
        }
      }
    }
  },
  plugins: []
};

export default config;
