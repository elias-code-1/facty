/** Configuration Tailwind CSS v3 (adaptée pour v4 si nécessaire) */
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
      },
      colors: {
        primary: '#6366F1',
        sidebar: '#0F172A',
        background: '#F8FAFC',
      },
    },
  },
  plugins: [],
}
