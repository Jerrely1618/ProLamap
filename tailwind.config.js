/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        redSpecial:'#2E073F',
        light: {
          background: '#f7f2ff', 
          text1: '#A594F9', 
          text2: '#A594F9', 
          primary: '#e2eff1', 
          secondary: '#555273', 
        },
        dark: {
          background: '#070f2c',
          text1: '#9290C3', 
          text2: '#555273 ',
          primary: '#3b82f6',
          secondary: '#BECDFA', 
        },
        third:{
          background: '#2E073F',
          text1: '#2E073F',
          text2: '#A594F9',
          primary: '#2E073F',
          secondary: '#AD49E1',
        },
      },
      backgroundImage: {
        'light-gradient': 'linear-gradient(270deg, rgba(245,239,255,0.8), rgba(165,148,249,0.8))',
        'dark-gradient': 'linear-gradient(270deg, rgba(7, 15, 43, 1), rgba(22, 33, 71, 1))',
      },
      backdropBlur: {
        sm: '4px',
        md: '8px',
        lg: '12px',
      },
      boxShadow: {
        'glassy': '0 4px 30px rgba(0, 0, 0, 0.1)',
      },
      opacity: {
        'glass': '0.8',
      },
    },
  },
  plugins: [],
};
