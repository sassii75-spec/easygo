import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        pretendard: ["Pretendard", "sans-serif"],
      },
      colors: {
        primary: {
          DEFAULT: "#008653",
          light: "#339d75",
          dark: "#00623e",
        },
        secondary: {
          DEFAULT: "#025096",
          light: "#3473ab",
          dark: "#013b6f",
        },
      },
    },
  },
  plugins: [],
};
export default config;
