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
        // Material Design Colors
        primary: {
          DEFAULT: "#1976D2",
          50: "#E3F2FD",
          100: "#BBDEFB",
          200: "#90CAF9",
          500: "#2196F3",
          600: "#1976D2",
          700: "#1565C0",
        },
        secondary: {
          DEFAULT: "#00796B",
          50: "#E0F2F1",
          100: "#B2DFDB",
          200: "#80CBC4",
          500: "#009688",
          600: "#00796B",
        },
        error: {
          DEFAULT: "#D32F2F",
          50: "#FFEBEE",
          100: "#FFCDD2",
          200: "#EF9A9A",
          300: "#E57373",
          500: "#F44336",
          600: "#D32F2F",
        },
        success: {
          DEFAULT: "#388E3C",
          50: "#E8F5E9",
          100: "#C8E6C9",
          200: "#A5D6A7",
          500: "#4CAF50",
          600: "#388E3C",
        },
        // Material Gray Scale
        material: {
          gray: {
            50: "#FAFAFA",
            100: "#F5F5F5",
            200: "#EEEEEE",
            300: "#E0E0E0",
            400: "#BDBDBD",
            500: "#9E9E9E",
            600: "#757575",
            700: "#616161",
            800: "#424242",
            900: "#212121",
          },
        },
      },
      boxShadow: {
        "elevation-1": "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
        "elevation-2": "0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)",
        "elevation-4": "0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)",
        "elevation-8": "0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22)",
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

