/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B389f',
        'primary-dark': '#2d2a7a',
        'primary-light': '#5e5caa',
      }
    },
  },
  plugins: [],
}
