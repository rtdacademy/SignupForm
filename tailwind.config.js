// tailwind.config.js
const { fontFamily } = require("tailwindcss/defaultTheme")

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
    "app/**/*.{js,jsx,ts,tsx}",
    "components/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // Original color definitions
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
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      // Enhanced spacing for responsive layouts
      spacing: {
        'chat-xs': '0.5rem',    // 8px
        'chat-sm': '0.75rem',   // 12px
        'chat-md': '1rem',      // 16px
        'chat-lg': '1.5rem',    // 24px
        'input-xs': '60px',
        'input-sm': '80px',
        'input-md': '100px',
        'input-lg': '120px',
      },
      // Enhanced height configuration
      height: {
        'chat-sm': '300px',
        'chat-md': '400px',
        'chat-lg': '500px',
      },
      // Enhanced min-height configuration
      minHeight: {
        'chat-sm': '250px',
        'chat-md': '350px',
        'chat-lg': '450px',
      },
      // Enhanced max-height configuration
      maxHeight: {
        'chat-sm': '80vh',
        'chat-md': '85vh',
        'chat-lg': '90vh',
      },
      // Original border radius
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      // Original font family
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
      // Enhanced font sizes for better responsiveness
      fontSize: {
        'chat-xs': '0.75rem',    // 12px
        'chat-sm': '0.875rem',   // 14px
        'chat-base': '1rem',     // 16px
        'chat-lg': '1.125rem',   // 18px
      },
      // Original animations
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
    require("@tailwindcss/aspect-ratio"),
    require("@tailwindcss/container-queries"),
    require("tailwindcss-debug-screens"),
    require("@tailwindcss/nesting"),
  ],
}