/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#1b0a0a",
        textMain: "#fab5bf",
      },
    },
  },
  plugins: [],
};
