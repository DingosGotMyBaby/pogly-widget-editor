/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/renderer/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "var(--color-base)",
        body: "var(--color-body)",
        surface: "var(--color-surface)",
        input: "var(--color-input)",
        "input-hover": "var(--color-input-hover)",

        "text-primary": "var(--color-text-primary)",
        "text-secondary": "var(--color-text-secondary)",
        "text-muted": "var(--color-text-muted)",
        "text-disabled": "var(--color-text-disabled)",
        icon: "var(--color-icon)",

        accent: {
          DEFAULT: "var(--color-accent)",
          hover: "var(--color-accent-hover)",
          border: "var(--color-accent-border)",
        },

        border: "var(--color-border)",
        "border-dark": "var(--color-border-dark)",
        "border-subtle": "var(--color-border-subtle)",
        "border-hover": "var(--color-border-hover)",

        "surface-hover": "var(--color-surface-hover)",
        separator: "var(--color-separator)",
        "selected-bg": "var(--color-selected-bg)",
        skeleton: "var(--color-skeleton)",

        "accent-muted": "var(--color-accent-muted)",
        "accent-selected-border": "var(--color-accent-selected-border)",

        danger: "var(--color-danger)",
        warning: "var(--color-warning)",
      },
    },
  },
  plugins: [],
};
