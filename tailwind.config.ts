import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        // Toss Design System Colors
        brand: {
          blue: "#3182F6",
          "blue-light": "#E8F3FF",
        },
        text: {
          primary: "#191F28",
          secondary: "#4E5968",
          tertiary: "#8B95A1",
          white: "#FFFFFF",
        },
        bg: {
          base: "#F2F4F6",
          surface: "#FFFFFF",
          input: "#F9FAFB",
        },
        semantic: {
          error: "#F04452",
          success: "#3182F6",
        },
        // Legacy Material colors (backward compatibility)
        primary: {
          DEFAULT: "#3182F6",
          50: "#E8F3FF",
          100: "#E8F3FF",
          200: "#E8F3FF",
          500: "#3182F6",
          600: "#3182F6",
          700: "#3182F6",
        },
        error: {
          DEFAULT: "#F04452",
          50: "#FEF2F2",
          100: "#FEE2E2",
          200: "#FECACA",
          500: "#F04452",
          600: "#F04452",
        },
        success: {
          DEFAULT: "#3182F6",
          50: "#E8F3FF",
          100: "#E8F3FF",
          500: "#3182F6",
          600: "#3182F6",
        },
        // Material Gray Scale (backward compatibility)
        material: {
          gray: {
            50: "#F2F4F6",
            100: "#F9FAFB",
            200: "#F2F4F6",
            300: "#E5E8EB",
            400: "#D1D6DB",
            500: "#8B95A1",
            600: "#4E5968",
            700: "#4E5968",
            800: "#191F28",
            900: "#191F28",
          },
        },
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        DEFAULT: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        // Legacy Material elevation (backward compatibility)
        "elevation-1": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        "elevation-2": "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        "elevation-4": "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        "elevation-8": "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      },
      transitionTimingFunction: {
        "material": "cubic-bezier(0.4, 0.0, 0.2, 1)",
        "fluent": "cubic-bezier(0.1, 0.9, 0.2, 1)",
      },
      transitionDuration: {
        "material-fast": "200ms",
        "material-standard": "300ms",
        "material-slow": "500ms",
      },
    },
  },
  plugins: [],
};
export default config;

