import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#1e3a5f",
          foreground: "#ffffff",
          50: "#f0f4f9",
          100: "#d9e4f0",
          200: "#b3c8e0",
          300: "#8dacd1",
          400: "#6790c1",
          500: "#4174b2",
          600: "#2e5a8e",
          700: "#1e3a5f",
          800: "#152a45",
          900: "#0c1a2b",
        },
        gold: {
          DEFAULT: "#c9a84c",
          50: "#fdf8ec",
          100: "#f9edd0",
          200: "#f3daa1",
          300: "#edc872",
          400: "#e7b543",
          500: "#c9a84c",
          600: "#a8883d",
          700: "#87682e",
          800: "#66481f",
          900: "#452810",
        },
        sand: {
          DEFAULT: "#f5efe6",
          50: "#fdfbf8",
          100: "#f9f4ec",
          200: "#f5efe6",
          300: "#ede3d3",
          400: "#e5d7c0",
          500: "#ddcbad",
          600: "#c9b08a",
          700: "#b59567",
          800: "#8f7244",
          900: "#6a4f21",
        },
        navy: {
          DEFAULT: "#1e3a5f",
          light: "#2d5282",
          dark: "#0f1e30",
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
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-playfair)", "Georgia", "serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
