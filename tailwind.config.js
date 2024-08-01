/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./client/**/*.{js,jsx,ts,tsx}", "./client/**/**/*.{js,jsx,ts,tsx}", "./public/**/*.{html,js}"],
  theme: {
    extend: {},
  },
  daisyui: {
    themes: ["dark", "synthwave"],
  },
  plugins: [
    require('daisyui'),

  ],
}

