import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#FFF8EF",
        ink: "#2B2A33",
        coral: {
          50: "#FFF1EC",
          100: "#FFE0D5",
          400: "#F7875F",
          500: "#EF6C43",
          600: "#D9552D",
          700: "#B4431F",
        },
        teal: {
          50: "#E8F6F4",
          100: "#C9EBE6",
          500: "#1F8A80",
          600: "#17736B",
          700: "#115A54",
        },
        sun: {
          100: "#FFF2C7",
          400: "#FFC93C",
          500: "#F5B400",
        },
      },
      fontFamily: {
        sans: ["Nunito", "system-ui", "sans-serif"],
        display: ["Fredoka", "Nunito", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 10px 30px -12px rgba(43, 42, 51, 0.18)",
      },
    },
  },
  plugins: [],
};

export default config;
