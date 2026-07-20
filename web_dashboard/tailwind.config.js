/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        zenda: {
          primary: {
            DEFAULT: '#1A3C6E',
            light: '#2B5A9E',
            dark: '#0F2645',
            50: '#E8EDF6',
            100: '#D1DBED',
            200: '#A3B7DB',
            300: '#7593C9',
            400: '#476FB7',
            500: '#1A3C6E',
            600: '#153058',
            700: '#102442',
            800: '#0A182C',
            900: '#050C16',
          },
          secondary: {
            DEFAULT: '#F5A623',
            light: '#F7C35C',
            dark: '#D48A0E',
            50: '#FEF7ED',
            100: '#FDEFDB',
            200: '#FBDFB7',
            300: '#F9CF93',
            400: '#F7BF6F',
            500: '#F5A623',
            600: '#C4851C',
            700: '#936415',
            800: '#62420E',
            900: '#312107',
          },
          accent: {
            DEFAULT: '#00B4D8',
            light: '#48CAE4',
            dark: '#0077B6',
            50: '#E6F7FA',
            100: '#CCEEF5',
            200: '#99DDEB',
            300: '#66CCE1',
            400: '#33BBD7',
            500: '#00B4D8',
            600: '#0090AD',
            700: '#006C82',
            800: '#004857',
            900: '#00242B',
          }
        }
      },
      fontFamily: {
        'zenda': ['Inter', 'sans-serif'],
        'zenda-display': ['Poppins', 'sans-serif'],
      },
      backgroundImage: {
        'zenda-gradient': 'linear-gradient(135deg, #1A3C6E 0%, #2B5A9E 100%)',
        'zenda-hero': 'linear-gradient(135deg, #1A3C6E 0%, #00B4D8 100%)',
      },
    },
  },
  plugins: [],
}
