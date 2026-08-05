/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    screens: {
      xs: "480px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      colors: {
        canvas: {
          DEFAULT: "var(--canvas-default)",
          subtle: "var(--canvas-subtle)",
          inset: "var(--canvas-inset)",
        },
        border: {
          DEFAULT: "var(--border-default)",
          muted: "var(--border-muted)",
        },
        fg: {
          DEFAULT: "var(--fg-default)",
          muted: "var(--fg-muted)",
        },
        accent: {
          fg: "var(--accent-fg)",
          emphasis: "var(--accent-emphasis)",
          subtle: "var(--accent-subtle)",
        },
      },
    },
  },
  plugins: [],
}