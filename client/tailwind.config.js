/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        skyblue: 'rgb(0, 191, 255)',
        navyblack: 'rgb(2, 6, 63)',
        cover: 'rgba(0,0,0,0.6)'
      },
    },
  },
  plugins: [],
}