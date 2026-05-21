/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        display: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
      colors: {
        // Premium dark palette — calibrated for OLED-style cinematic depth.
        ink: {
          950: '#070708',
          900: '#0a0a0c',
          850: '#0f0f12',
          800: '#16161a',
          700: '#1d1d22',
          600: '#26262c',
          500: '#3a3a42',
          400: '#5a5a64',
          300: '#8b8b95',
          200: '#c4c4cc',
          100: '#e8e8ee',
          50:  '#f5f5f8',
        },
        // Signature accent: violet→indigo, the "AI" hue.
        brand: {
          50:  '#eef0ff',
          100: '#dbdfff',
          200: '#b6bdff',
          300: '#8a93ff',
          400: '#6b6fff',
          500: '#5b54ff',
          600: '#4a3df0',
          700: '#3a2dd1',
          800: '#2d23a3',
          900: '#1e1872',
        },
        // Secondary accent — cool cyan for data viz / "fresh" highlights.
        cyan: {
          400: '#5ee2ff',
          500: '#22d3ee',
          600: '#0bb6d4',
        },
        success: {
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
        },
        warning: {
          400: '#fbbf24',
          500: '#f59e0b',
        },
        danger: {
          400: '#f87171',
          500: '#ef4444',
        },
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'glow-sm': '0 0 20px -5px rgba(91, 84, 255, 0.35)',
        'glow':    '0 0 40px -10px rgba(91, 84, 255, 0.45)',
        'glow-lg': '0 0 80px -10px rgba(91, 84, 255, 0.55)',
        'inner-glow': 'inset 0 0 0 1px rgba(255, 255, 255, 0.06)',
        'card':    '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 30px 60px -30px rgba(0,0,0,0.6)',
      },
      backgroundImage: {
        'grid-faint':
          "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)",
        'aurora':
          'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(91,84,255,0.35), transparent), radial-gradient(ellipse 60% 40% at 80% 20%, rgba(34,211,238,0.18), transparent), radial-gradient(ellipse 60% 40% at 10% 80%, rgba(167,139,250,0.18), transparent)',
        'gradient-brand':
          'linear-gradient(135deg, #6b6fff 0%, #8a55ff 50%, #22d3ee 100%)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.9' },
          '50%':      { opacity: '0.5' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        aurora: {
          '0%, 100%': { transform: 'translate3d(0,0,0) scale(1)' },
          '33%':      { transform: 'translate3d(-3%, 2%, 0) scale(1.05)' },
          '66%':      { transform: 'translate3d(2%, -3%, 0) scale(0.97)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        float:      'float 6s ease-in-out infinite',
        pulseSoft:  'pulseSoft 2.4s ease-in-out infinite',
        shimmer:    'shimmer 2.4s linear infinite',
        aurora:     'aurora 22s ease-in-out infinite',
        scaleIn:    'scaleIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      transitionTimingFunction: {
        'out-expo':   'cubic-bezier(0.16, 1, 0.3, 1)',
        'out-quart':  'cubic-bezier(0.25, 1, 0.5, 1)',
      },
    },
  },
  plugins: [],
};
