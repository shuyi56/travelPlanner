/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        "bounce-sm": {
          "0%, 100%": {
            transform: "translateY(0)",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          },
          "50%": {
            transform: "translateY(-4px)",
            boxShadow: "0 8px 16px rgba(0,0,0,0.15)",
          },
        },
      },
      animation: {
        "bounce-sm": "bounce-sm 0.3s ease-in-out",
      },
    },
  },
  plugins: [],
};
