/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        redSpecial:'#2E073F',
        light: {
          background: '#F5EFFF', 
          text1: '#A594F9', 
          text2: '#A594F9', 
          primary: '#e2eff1', 
          secondary: '#555273', 
        },
        dark: {
          background: '#070F2B',
          text1: '#9290C3', 
          text2: '#555273 ',
          primary: '#3b82f6',
          secondary: '#9290C3', 
        },
        third:{
          background: '#2E073F',
          text1: '#2E073F',
          text2: '#A594F9',
          primary: '#2E073F',
          secondary: '#AD49E1',
        }
      },
    },
  },
  plugins: [],
};
