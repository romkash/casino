module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        gold: "#FFD700",
        red: {
          900: "#7f1d1d",
          600: "#dc2626",
        },
      },
      animation: {
        shine: "shine 3s infinite",
      },
      keyframes: {
        shine: {
          "0%": { transform: "translateX(-100%) rotate(-12deg)" },
          "100%": { transform: "translateX(200%) rotate(-12deg)" },
        },
      },
      borderRadius: {
        xl: "0.75rem",
      },
      fontFamily: {
        playfair: ["Playfair Display", "serif"],
        roboto: ["Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};