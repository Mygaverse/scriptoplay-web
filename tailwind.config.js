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
        primary: "#0070f3",
        dark: "#000000",
        light: "#f5f5f5",

        background: "#000000", // Main app background - "hsl(var(--color-background))"
        surface: "#09090b",    // Cards / Sidebars (zinc-950) - "hsl(var(--color-surface))"
        border: "#27272a",     // Borders (zinc-800) 
        
        // Brand Identity (The Pink/Purple)
        brand: {
          DEFAULT: "#C026D3", // fuchsia-600 - "hsl(var(--color-brand))"
          hover: "#A21CAF",   // fuchsia-700
          light: "#E879F9",   // fuchsia-400 (for text highlights)
          glow: "rgba(192, 38, 211, 0.5)", // For shadows
        },
        
        // Text hierarchies
        txt: {
          main: "#FFFFFF",
          secondary: "#A1A1AA", // zinc-400
          muted: "#52525B",     // zinc-600
        }
      },
    },
  },
  plugins: [],
}
