/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        space: {
          950: '#030509',
          900: '#050811',
          800: '#080d1a',
          700: '#0d1424',
          600: '#111827',
          500: '#1a2235',
        },
        accent: {
          DEFAULT: '#6366f1',
          hover:   '#818cf8',
          soft:    'rgba(99,102,241,0.12)',
          glow:    'rgba(99,102,241,0.45)',
        },
        purple: {
          neon: '#a855f7',
          glow: 'rgba(168,85,247,0.4)',
        },
        pink: {
          cyber: '#ec4899',
          glow:  'rgba(236,72,153,0.4)',
        },
        mint: {
          DEFAULT: '#00ffa3',
          soft:    'rgba(0,255,163,0.12)',
          glow:    'rgba(0,255,163,0.4)',
        },
        coral: {
          DEFAULT: '#ff4757',
          soft:    'rgba(255,71,87,0.12)',
          glow:    'rgba(255,71,87,0.4)',
        },
        amber: {
          neon: '#fbbf24',
          soft: 'rgba(251,191,36,0.12)',
        },
        border: {
          DEFAULT: 'rgba(99,102,241,0.15)',
          focus:   'rgba(99,102,241,0.5)',
          glow:    'rgba(99,102,241,0.7)',
        },
      },
      backgroundImage: {
        'gradient-primary':  'linear-gradient(135deg, #6366f1, #a855f7, #ec4899)',
        'gradient-mint':     'linear-gradient(135deg, #00ffa3, #00c8ff)',
        'gradient-coral':    'linear-gradient(135deg, #ff4757, #ff6b81)',
        'gradient-card':     'linear-gradient(145deg, rgba(13,20,36,0.8), rgba(8,13,26,0.95))',
        'gradient-sidebar':  'linear-gradient(180deg, #080d1a 0%, #050811 100%)',
        'gradient-mesh':     'radial-gradient(ellipse at 20% 20%, rgba(99,102,241,0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(168,85,247,0.1) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(236,72,153,0.06) 0%, transparent 60%)',
      },
      boxShadow: {
        'glow-accent':  '0 0 20px rgba(99,102,241,0.4), 0 0 60px rgba(99,102,241,0.1)',
        'glow-mint':    '0 0 20px rgba(0,255,163,0.4), 0 0 60px rgba(0,255,163,0.1)',
        'glow-coral':   '0 0 20px rgba(255,71,87,0.4), 0 0 60px rgba(255,71,87,0.1)',
        'glow-purple':  '0 0 20px rgba(168,85,247,0.4), 0 0 60px rgba(168,85,247,0.1)',
        'glow-pink':    '0 0 20px rgba(236,72,153,0.4)',
        'card':         '0 4px 32px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.04) inset',
        'card-hover':   '0 8px 48px rgba(0,0,0,0.5), 0 0 24px rgba(99,102,241,0.2)',
        'modal':        '0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(99,102,241,0.2)',
      },
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%':   { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-right': {
          '0%':   { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-down': {
          '0%':   { opacity: '0', transform: 'translateY(-12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        'pulse-ring': {
          '0%':    { transform: 'scale(1)', opacity: '1' },
          '100%':  { transform: 'scale(2.4)', opacity: '0' },
        },
        'glow-breathe': {
          '0%, 100%': { boxShadow: '0 0 8px rgba(99,102,241,0.3)' },
          '50%':      { boxShadow: '0 0 24px rgba(99,102,241,0.7), 0 0 48px rgba(168,85,247,0.3)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        'orbit': {
          '0%':   { transform: 'rotate(0deg) translateX(120px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(120px) rotate(-360deg)' },
        },
        'border-spin': {
          '0%':   { backgroundPosition: '0% 50%' },
          '50%':  { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'float-up': {
          '0%':   { transform: 'translateY(0) scale(1)', opacity: '0.5' },
          '100%': { transform: 'translateY(-110vh) scale(0.5)', opacity: '0' },
        },
      },
      animation: {
        'fade-up':       'fade-up 0.5s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in':       'fade-in 0.4s ease both',
        'scale-in':      'scale-in 0.3s cubic-bezier(0.16,1,0.3,1) both',
        'slide-right':   'slide-right 0.4s cubic-bezier(0.16,1,0.3,1) both',
        'slide-down':    'slide-down 0.3s cubic-bezier(0.16,1,0.3,1) both',
        'shimmer':       'shimmer 2.5s linear infinite',
        'pulse-ring':    'pulse-ring 1.5s cubic-bezier(0.4,0,0.6,1) infinite',
        'glow-breathe':  'glow-breathe 3s ease-in-out infinite',
        'float':         'float 4s ease-in-out infinite',
        'float-up':      'float-up linear infinite',
        'border-spin':   'border-spin 4s ease infinite',
        'spin-slow':     'spin 8s linear infinite',
      },
      backdropBlur: {
        xs: '2px',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
};
