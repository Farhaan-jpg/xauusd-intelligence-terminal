import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#080b11",
        surface: "#0f141c",
        card: "#141a24",
        "card-hover": "#1a2230",
        border: "#1f2937",
        "border-focus": "#374151",
        gold: {
          DEFAULT: "#f59e0b",
          light: "#fbbf24",
          dark: "#d97706",
          glow: "rgba(245, 158, 11, 0.15)"
        },
        bullish: {
          DEFAULT: "#10b981",
          light: "#34d399",
          glow: "rgba(16, 185, 129, 0.15)"
        },
        bearish: {
          DEFAULT: "#ef4444",
          light: "#f87171",
          glow: "rgba(239, 68, 68, 0.15)"
        },
        text: {
          primary: "#f3f4f6",
          secondary: "#9ca3af",
          muted: "#6b7280"
        }
      },
      fontFamily: {
        mono: ["SF Mono", "Fira Code", "Roboto Mono", "monospace"],
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"]
      }
    },
  },
  plugins: [],
};
export default config;
