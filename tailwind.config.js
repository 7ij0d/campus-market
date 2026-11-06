/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F0F7F7',
          100: '#E3EFEF',
          200: '#C5E0E1',
          300: '#94C9CB',
          400: '#5BB3B6',
          500: '#36A6A6', // Secondary Medium Turquoise
          600: '#087E83', // Primary Dark Turquoise
          700: '#06666A',
          800: '#054E52',
          900: '#18343B', // Deep Navy Dark Text
        },
        surface: {
          bg: '#F8FAFC',
          card: '#FFFFFF',
          soft: '#ECF3F4',
          border: '#E5EAED',
          muted: '#74838A',
          dark: '#18343B',
        },
        offer: {
          gold: '#F3C95B',
          soft: '#FDF8E7',
        }
      },
      fontFamily: {
        sans: ['"IBM Plex Sans Arabic"', 'Cairo', 'Inter', 'sans-serif'],
        en: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 10px -2px rgba(24, 52, 59, 0.05), 0 0 0 1px #E5EAED',
        'card-hover': '0 8px 22px -4px rgba(8, 126, 131, 0.12), 0 0 0 1px rgba(8, 126, 131, 0.25)',
        'header': '0 1px 6px rgba(24, 52, 59, 0.04)',
        'nav': '0 -2px 12px rgba(24, 52, 59, 0.05)',
      }
    },
  },
  plugins: [],
}
