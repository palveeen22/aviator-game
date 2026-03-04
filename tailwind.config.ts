import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        orbitron: ['var(--font-orbitron)', 'monospace'],
        rajdhani: ['var(--font-rajdhani)', 'sans-serif'],
      },
      colors: {
        game: {
          bg: '#050508',
          panel: '#0d1117',
          border: '#1e2030',
          accent: '#ff4422',
          green: '#00ff88',
          orange: '#ff6600',
        },
      },
      keyframes: {
        'crash-pulse': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.15)' },
        },
        'cashout-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255,102,0,0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(255,102,0,0.9)' },
        },
        'chip-in': {
          from: { transform: 'translateX(-16px)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        'toast-in': {
          from: { transform: 'translateX(-50%) translateY(-60px)', opacity: '0' },
          to: { transform: 'translateX(-50%) translateY(0)', opacity: '1' },
        },
        'balance-win': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.25)', color: '#ffff00' },
          '100%': { transform: 'scale(1)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'count-pulse': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.1)', opacity: '0.7' },
        },
      },
      animation: {
        'crash-pulse': 'crash-pulse 0.5s ease',
        'cashout-glow': 'cashout-glow 1s ease infinite',
        'chip-in': 'chip-in 0.3s ease',
        'toast-in': 'toast-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'balance-win': 'balance-win 0.5s ease',
        'fade-in': 'fade-in 0.3s ease',
        'count-pulse': 'count-pulse 1s ease infinite',
      },
    },
  },
  plugins: [],
}

export default config
