import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81"
        },
        accent: {
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2"
        }
      },
      boxShadow: {
        glass: "0 10px 40px -15px rgba(15, 23, 42, 0.35)",
        soft: "0 8px 30px -10px rgba(30, 41, 59, 0.25)"
      },
      borderRadius: {
        xl: "0.95rem"
      },
      backgroundImage: {
        "hero-grid": "radial-gradient(circle at 1px 1px, rgba(148,163,184,0.15) 1px, transparent 0)"
      },
      backgroundSize: {
        "hero-grid": "24px 24px"
      }
    }
  },
  plugins: []
};

export default config;
