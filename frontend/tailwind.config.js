/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  safelist: [
    "animate-toast-in",
    "animate-toast-out",
    "border-[#16a34a40]",
    "border-error/30",
    "bg-error-container/40",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0058bc",
        "on-primary": "#ffffff",
        "primary-container": "#0070eb",
        secondary: "#4f6073",
        tertiary: "#005da7",
        surface: "#f8f9fa",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f3f4f5",
        "surface-container-highest": "#e1e3e4",
        "on-surface": "#191c1d",
        "on-surface-variant": "#414755",
        outline: "#717786",
        "outline-variant": "#c1c6d7",
        error: "#ba1a1a",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",
        "risk-low": "#16a34a",
        "risk-medium": "#f59e0b",
        "risk-high": "#dc2626",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "level-1": "0px 2px 4px rgba(0, 0, 0, 0.05)",
        "level-2": "0px 8px 24px rgba(0, 0, 0, 0.08)",
        "focus-glow": "0 0 0 2px #0058bc",
      },
      keyframes: {
        "toast-in": {
          from: { opacity: "0", transform: "translateY(-12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "toast-out": {
          from: { opacity: "1", transform: "translateY(0)" },
          to: { opacity: "0", transform: "translateY(-8px)" },
        },
      },
      animation: {
        "toast-in": "toast-in 0.28s ease-out",
        "toast-out": "toast-out 0.2s ease-in forwards",
      },
    },
  },
  plugins: [],
};
