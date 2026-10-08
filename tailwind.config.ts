import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        coral: {
          500: '#FF6B6B',
          600: '#ff5252',
        },
        softOrange: '#FFA07A',
        success: '#4CAF50',
        pending: '#FFC107',
        rejected: '#F44336'
      },
    },
  },
  plugins: [],
};
export default config;
