import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      scale: {
        'x-150': '1.5',
      },
      fontSize: {
        '9xl': '9rem', // Add a new font size class
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      keyframes: {
        typing: {
          "0%": {
            width: "0%",
            visibility: "hidden",
          },
          "100%": {
            width: "100%",
          },
        },
        blink: {
          "50%": {
            borderColor: "transparent",
          },
          "100%": {
            borderColor: "white",
          },
        },
        glitchHover: {
          "0%": {
            textShadow: "4px 0 0 rgba(255, 0, 0, 0.9), -4px 0 0 rgba(0, 255, 0, 0.9)",
          },
          "5%": {
            textShadow: "-4px 0 0 rgba(255, 0, 0, 0.9), 4px 0 0 rgba(0, 255, 0, 0.9)",
          },
          "10%": {
            textShadow: "4px 0 0 rgba(255, 0, 0, 0.9), -4px 0 0 rgba(0, 255, 0, 0.9)",
          },
          "15%": {
            textShadow: "-4px 0 0 rgba(255, 0, 0, 0.9), 4px 0 0 rgba(0, 255, 0, 0.9)",
          },
          "20%": {
            textShadow: "4px 0 0 rgba(255, 0, 0, 0.9), -4px 0 0 rgba(0, 255, 0, 0.9)",
          },
          "25%": { textShadow: "normal" },
          "100%": { textShadow: "normal" },
        },
        slideRight: {
          "0%": {
            transform: "translateX(-100%)",
          },
          "100%": {
            transform: "translateX(0)",
          },
        },
        slideLeft: {
          "0%": {
            transform: "translateX(100%)",
          },
          "100%": {
            transform: "translateX(0)",
          },
        },
      },
      animation: {
        typing: "typing 2s steps(20) alternate, blink .7s infinite",
        glitchHover: "glitchHover 5s infinite",
        slideRight: "slideRight 0.5s ease-in-out", // Remove single quotes
        slideLeft: "slideLeft 0.5s ease-in-out", // Remove single quotes
      },
    },
  },
  plugins: [],
};

export default config;
