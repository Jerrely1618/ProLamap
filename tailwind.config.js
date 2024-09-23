/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        light: {
          background: '#e2eff1', 
          text1: '#65799b', 
          text2: '#3490dc', 
          primary: '#e2eff1', 
          secondary: '#555273', 
        },
        dark: {
          background: '#1a202c',
          text1: '#e2eff1', 
          text2: '#555273 ',
          primary: '#3b82f6',
          secondary: '#f59e0b', 
        },
      },
    },
  },
  plugins: [],
};
