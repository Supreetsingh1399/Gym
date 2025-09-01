/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0091EA",
        secondary: "#64B5F6",
        background: "#FFFFFF",
        text: "#333333",
        error: "#FF5252",
        success: "#4CAF50",
        warning: "#FFC107",
      },
    },
  },
  plugins: [],
};
