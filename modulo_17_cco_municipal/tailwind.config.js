/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        zenda: {
          primary: '#1A3C6E',
          secondary: '#F5A623',
          accent: '#00B4D8',
        }
      }
    },
  },
  plugins: [],
}
