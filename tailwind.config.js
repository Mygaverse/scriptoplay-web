/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
  "./pages/**/*.{ts,tsx}",
  "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0070f3",
        dark: "#000000",
        light: "#f5f5f5",
      },
    },
  },
  plugins: [],
}
