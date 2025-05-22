import { heroui } from "@heroui/theme";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/layouts/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: "475px",
        tablet: "768px",
        "3xl": "1920px",
      },
      animation: {
        microscope: "microscope-float 3s ease-in-out infinite",
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()],
};
