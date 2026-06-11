/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("nativewind/preset")],
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: "#22D3EE",
        neon: "#8B5CF6",
        darkbg: "#030712",
        glass: "#0F172A",
      },
    },
  },
  plugins: [],
};