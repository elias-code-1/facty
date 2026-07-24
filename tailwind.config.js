/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '375px',
        '3xl': '1920px',
        '4xl': '2560px'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        geist: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      colors: {
        primary: '#6366F1',
        sidebar: '#0F172A',
        background: '#F8FAFC',
        brand: {
          white: '#FFFFFF',
          lightGray: '#F7F8FC',
          cardGray: '#F1F3F9',
          dark: '#1E1F22',
          border: '#E3E5E8',
          textDark: '#1A1A2E',
          textMuted: '#5C6370',
          bluePrimary: '#5865F2',
          blueSky: '#3B82F6',
          greenSuccess: '#22C55E',
          redError: '#EF4444',
          goldCertified: '#F5A623',
          purplePremium: '#9B59B6'
        }
      },
    },
  },
  plugins: [],
}
