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
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#6D28D9',
          700: '#5B21B6',
          800: '#4C1D95',
          900: '#2E1065',
        }
      },
      fontFamily: {
        sans: ['"IBM Plex Sans Arabic"', 'Cairo', 'Inter', 'sans-serif'],
        en: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 12px -2px rgba(30, 20, 60, 0.06), 0 0 0 1px rgba(109, 40, 217, 0.05)',
        'card-hover': '0 8px 24px -4px rgba(109, 40, 217, 0.12), 0 0 0 1px rgba(109, 40, 217, 0.12)',
        'header': '0 2px 10px rgba(0, 0, 0, 0.03)',
        'nav': '0 -4px 16px rgba(30, 20, 60, 0.06)',
      }
    },
  },
  plugins: [],
}
