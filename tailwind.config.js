/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        navy: {
          50: '#eef2f8',
          100: '#d7e1ef',
          200: '#adc2dd',
          300: '#7d9cc7',
          400: '#4f74a8',
          500: '#33527f',
          600: '#233c60',
          700: '#1a2d4a',
          800: '#152744',
          900: '#0e1a2e',
        },
        teal: {
          50: '#e9fbfa',
          100: '#c9f3f1',
          200: '#96e6e2',
          300: '#5cd2cd',
          400: '#26b3ad',
          500: '#0e8388',
          600: '#0a6c70',
          700: '#0a565a',
          800: '#0b4548',
          900: '#0b3739',
        },
        sand: {
          50: '#f7f7f5',
          100: '#eeeee9',
        },
        green: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(14,26,46,0.06), 0 1px 6px rgba(14,26,46,0.05)',
      },
      backgroundImage: {
        'dot-pattern': 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
      },
      backgroundSize: {
        'dot': '28px 28px',
      },
    },
  },
  plugins: [],
}

