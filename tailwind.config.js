/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: { gold: '#D4AF37', base: '#0B0B0D', muted: '#a1a1aa' },
      fontFamily: { sans: ['Lexend', 'sans-serif'], display: ['Space Grotesk', 'sans-serif'] }
    }
  },
  plugins: [],
}
