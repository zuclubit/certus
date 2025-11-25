/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    screens: {
      'xxs': '340px',   // Tiny phones (340-359px) - NEW!
      'xs': '360px',    // Small phones (360-479px)
      'sm': '480px',    // Standard phones (480-767px)
      'md': '768px',    // Tablets (768-1023px)
      'lg': '1024px',   // Desktop (1024-1279px)
      'xl': '1280px',   // Large desktop (1280-1535px)
      '2xl': '1536px',  // Extra large desktop (1536px+)
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0066FF',
          dark: '#0A2540',
          light: '#3385FF',
          50: '#E6F0FF',
          100: '#CCE0FF',
          200: '#99C2FF',
          300: '#66A3FF',
          400: '#3385FF',
          500: '#0066FF',
          600: '#0052CC',
          700: '#003D99',
          800: '#002966',
          900: '#001433'
        },
        success: {
          DEFAULT: '#00D4AA',
          light: '#33DDBB',
          dark: '#00A789',
          50: '#E6FBF7',
          100: '#CCF7EF',
          200: '#99EFDF',
          300: '#66E7CF',
          400: '#33DDBF',
          500: '#00D4AA',
          600: '#00AA88',
          700: '#008066',
          800: '#005544',
          900: '#002B22'
        },
        warning: {
          DEFAULT: '#FF6B35',
          light: '#FF8A5E',
          dark: '#CC5629',
          50: '#FFF3EE',
          100: '#FFE7DD',
          200: '#FFCFBB',
          300: '#FFB799',
          400: '#FF9F77',
          500: '#FF6B35',
          600: '#CC5629',
          700: '#99411F',
          800: '#662B14',
          900: '#33160A'
        },
        danger: {
          DEFAULT: '#EF4444',
          light: '#F87171',
          dark: '#DC2626',
          50: '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          300: '#FCA5A5',
          400: '#F87171',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
          800: '#991B1B',
          900: '#7F1D1D'
        },
        neutral: {
          50: '#F7F9FC',
          100: '#EDF1F7',
          200: '#E1E8F0',
          300: '#C7D2E0',
          400: '#8B95A5',
          500: '#5B6B7D',
          600: '#404E5F',
          700: '#2D3748',
          800: '#1A202C',
          900: '#0F1419'
        }
      },
      fontFamily: {
        // SF Pro Display/Text fallback stack (iOS 2025 standard)
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Helvetica Neue', 'Segoe UI', 'system-ui', 'sans-serif'],
        display: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Helvetica Neue', 'system-ui', 'sans-serif'],
        text: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'Helvetica Neue', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Monaco', 'Menlo', 'Courier New', 'monospace']
      },
      fontSize: {
        // Apple HIG Typography Scale
        'xs': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0' }],        // 12px - Caption 2
        'sm': ['0.8125rem', { lineHeight: '1.4', letterSpacing: '0' }],      // 13px - Caption 1
        'base': ['0.9375rem', { lineHeight: '1.4', letterSpacing: '0' }],    // 15px - Footnote
        'md': ['1rem', { lineHeight: '1.4', letterSpacing: '0' }],           // 16px - Callout
        'lg': ['1.0625rem', { lineHeight: '1.4', letterSpacing: '0' }],      // 17px - Body (Apple default)
        'xl': ['1.25rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],  // 20px - Title 3
        '2xl': ['1.375rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }], // 22px - Title 2
        '3xl': ['1.75rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],  // 28px - Title 1
        '4xl': ['2.125rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }], // 34px - Large Title
        '5xl': ['2.625rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }], // 42px - Hero
        '6xl': ['3.5rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],   // 56px - Display
      },
      letterSpacing: {
        tighter: '-0.02em',
        tight: '-0.01em',
        normal: '0',
        wide: '0.01em',
        wider: '0.02em',
      },
      borderRadius: {
        lg: '0.75rem',
        md: '0.5rem',
        sm: '0.375rem'
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      },
      spacing: {
        safe: 'env(safe-area-inset-bottom)',
      },
      padding: {
        safe: 'env(safe-area-inset-bottom)',
      },
      margin: {
        safe: 'env(safe-area-inset-bottom)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'zoom-in': {
          '0%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'spring': {
          '0%': { transform: 'scale(0.9) translateY(4px)' },
          '50%': { transform: 'scale(1.05) translateY(-2px)' },
          '100%': { transform: 'scale(1) translateY(0)' },
        },
        'glow': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(0.98)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-2px)' },
        },
        'icon-pop': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)' },
        },
        'badge-bounce': {
          '0%': { transform: 'scale(0) rotate(0deg)' },
          '50%': { transform: 'scale(1.2) rotate(10deg)' },
          '100%': { transform: 'scale(1) rotate(0deg)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'zoom-in': 'zoom-in 0.3s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'spring': 'spring 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'glow': 'glow 2s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
        'shimmer': 'shimmer 3s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'icon-pop': 'icon-pop 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'badge-bounce': 'badge-bounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    }
  },
  plugins: []
}
