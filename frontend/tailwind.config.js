import tailwindcssAnimate from "tailwindcss-animate";

/** MedScope token → Tailwind color with opacity support (T-X03-03). */
const med = (name) => `rgb(var(${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  safelist: [
    "animate-toast-in",
    "animate-toast-out",
    "border-risk-low/25",
    "border-error/30",
    "bg-error-container/40",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        /* MedScope design tokens — index.css --color-* (T-X03-03) */
        "on-primary": med("--color-on-primary"),
        "primary-container": med("--color-primary-container"),
        tertiary: med("--color-tertiary"),
        "tertiary-container": med("--color-tertiary-container"),
        surface: med("--color-surface"),
        "surface-bright": med("--color-surface-bright"),
        "surface-dim": med("--color-surface-dim"),
        "surface-container": med("--color-surface-container"),
        "surface-container-lowest": med("--color-surface-container-lowest"),
        "surface-container-low": med("--color-surface-container-low"),
        "surface-container-high": med("--color-surface-container-high"),
        "surface-container-highest": med("--color-surface-container-highest"),
        "surface-variant": med("--color-surface-variant"),
        "on-surface": med("--color-on-surface"),
        "on-surface-variant": med("--color-on-surface-variant"),
        "on-background": med("--color-on-background"),
        outline: med("--color-outline"),
        "outline-variant": med("--color-outline-variant"),
        error: med("--color-error"),
        "error-container": med("--color-error-container"),
        "on-error-container": med("--color-on-error-container"),
        "secondary-container": med("--color-secondary-container"),
        "on-secondary-container": med("--color-on-secondary-container"),
        "risk-low": med("--color-risk-low"),
        "risk-medium": med("--color-risk-medium"),
        "risk-high": med("--color-risk-high"),
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      boxShadow: {
        "level-1": "var(--shadow-level-1)",
        "level-2": "var(--shadow-level-2)",
        "focus-glow": "var(--shadow-focus-glow)",
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
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "toast-in": "toast-in 0.28s ease-out",
        "toast-out": "toast-out 0.2s ease-in forwards",
        "fade-in-up": "fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
