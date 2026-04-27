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
          mint:   '#4FD1C5',
          lilac:  '#B794F4',
          peach:  '#F6AD55',
          navy:   '#2A4365',
          gold:   '#FBBF24',
          ember:  '#F97316',
          neon:   '#06B6D4',
          plasma: '#A78BFA',
        }
      },
      keyframes: {
        shake: {
          '0%,100%': { transform: 'translateX(0)' },
          '15%':     { transform: 'translateX(-10px) rotate(-1deg)' },
          '30%':     { transform: 'translateX(10px) rotate(1deg)' },
          '45%':     { transform: 'translateX(-7px)' },
          '60%':     { transform: 'translateX(7px)' },
          '75%':     { transform: 'translateX(-4px)' },
          '90%':     { transform: 'translateX(4px)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%':     { transform: 'translateY(-8px)' },
        },
        'combo-pop': {
          '0%':   { transform: 'scale(0.3)', opacity: '0' },
          '55%':  { transform: 'scale(1.4)', opacity: '1' },
          '100%': { transform: 'scale(1)',   opacity: '1' },
        },
        'slide-up': {
          from: { transform: 'translateY(16px)', opacity: '0' },
          to:   { transform: 'translateY(0)',    opacity: '1' },
        },
        'screen-flash': {
          '0%':   { opacity: '0' },
          '20%':  { opacity: '1' },
          '100%': { opacity: '0' },
        },
        lightning: {
          '0%':   { opacity: '0' },
          '10%':  { opacity: '1' },
          '20%':  { opacity: '0.2' },
          '35%':  { opacity: '0.9' },
          '50%,100%': { opacity: '0' },
        },
        'gate-glow': {
          '0%,100%': { filter: 'drop-shadow(0 0 8px rgba(167,139,250,0.7))' },
          '50%':     { filter: 'drop-shadow(0 0 24px rgba(167,139,250,1)) drop-shadow(0 0 48px rgba(99,102,241,0.5))' },
        },
        'star-twinkle': {
          '0%,100%': { opacity: '0.2', transform: 'scale(1)' },
          '50%':     { opacity: '1',   transform: 'scale(1.5)' },
        },
        'hero-enter': {
          from: { transform: 'translateX(-60px)', opacity: '0' },
          to:   { transform: 'translateX(0)',     opacity: '1' },
        },
        'victory-bounce': {
          '0%,100%': { transform: 'scale(1) translateY(0)' },
          '30%':     { transform: 'scale(1.25) translateY(-10px) rotate(-5deg)' },
          '60%':     { transform: 'scale(1.1) translateY(-4px) rotate(3deg)' },
        },
        'pulse-ring': {
          '0%':   { transform: 'scale(1)',   opacity: '0.8' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        'epic-reveal': {
          '0%':   { transform: 'scale(0.6) translateY(20px)', opacity: '0' },
          '70%':  { transform: 'scale(1.05) translateY(-2px)', opacity: '1' },
          '100%': { transform: 'scale(1) translateY(0)', opacity: '1' },
        },
        'token-float': {
          '0%':   { transform: 'translateY(0) scale(1)',    opacity: '1' },
          '100%': { transform: 'translateY(-70px) scale(1.4)', opacity: '0' },
        },
      },
      animation: {
        'shake':          'shake 0.5s ease-in-out',
        'float':          'float 3s ease-in-out infinite',
        'combo-pop':      'combo-pop 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        'slide-up':       'slide-up 0.4s ease-out forwards',
        'screen-flash':   'screen-flash 0.4s ease-out forwards',
        'lightning':      'lightning 0.6s ease-out forwards',
        'gate-glow':      'gate-glow 3s ease-in-out infinite',
        'star-twinkle':   'star-twinkle 2.5s ease-in-out infinite',
        'hero-enter':     'hero-enter 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.3s both',
        'victory-bounce': 'victory-bounce 0.6s ease-out',
        'pulse-ring':     'pulse-ring 1s ease-out infinite',
        'epic-reveal':    'epic-reveal 0.8s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'token-float':    'token-float 1.2s ease-out forwards',
      },
      backgroundImage: {
        'arena':  'linear-gradient(180deg, #0f0a1e 0%, #1a0a2e 35%, #0d1f3c 70%, #040d1a 100%)',
        'hero-card': 'linear-gradient(135deg, #1e1040 0%, #0d1f3c 50%, #1a0a2e 100%)',
      }
    }
  },
  plugins: []
};

export default config;
