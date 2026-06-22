/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        survey: {
          primary: "#1a3a2a",
          secondary: "#2d5a3d",
          accent: "#c9a96a",
          water: "#3a7ca5",
          success: "#4ac97a",
          error: "#c94a4a",
          warning: "#e0a040",
          terrain: {
            plain: "#5a8a4a",
            mountain: "#6a5a4a",
            forest: "#3a5a2a",
          },
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', "serif"],
        sans: ['"Noto Sans SC"', "sans-serif"],
      },
      backdropBlur: {
        xs: "2px",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-slow": "bounce 2s infinite",
      },
    },
  },
  plugins: [],
};
