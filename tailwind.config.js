/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1F8BFF',
          hover: '#4AA3FF',
          active: '#1668D9',
          soft: '#EAF3FF',
        },
        accent: {
          DEFAULT: '#12D6FF',
          soft: '#EAFBFF',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          secondary: '#EEF4FA',
          tertiary: '#F5F9FF',
        },
        page: '#F5F7FB',
        'border-color': {
          DEFAULT: '#D8E2F0',
          secondary: '#E6EDF5',
          card: '#B6E7FF',
        },
        'text-pri': '#0F172A',
        'text-sec': '#475569',
        'text-ter': '#7B8CA8',
        'text-qua': '#94A3B8',
        'status-success': '#22C55E',
        'status-warning': '#F59E0B',
        'status-error': '#EF4444',
      },
      borderRadius: {
        sm: '10px',
        DEFAULT: '14px',
        lg: '18px',
        xl: '24px',
      },
      boxShadow: {
        card: '0 10px 30px rgba(15, 23, 42, 0.06)',
        elevated: '0 20px 40px rgba(15, 23, 42, 0.10)',
        primary: '0 4px 16px rgba(31, 139, 255, 0.30)',
        accent: '0 0 20px rgba(18, 214, 255, 0.30)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
    },
  },
  plugins: [],
};
