/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cobalt: {
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
        },
        dark: {
          100: '#1E1E1E',
          200: '#171717',
          300: '#0A0A0A',
          400: '#050505',
        }
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
