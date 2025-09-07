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
        // Brand Colors
        brand: {
          primary: '#ffd700',
          'primary-dark': '#ffcc00',
          secondary: '#00fffc',
          tertiary: '#fc00ff',
        },
        // Enhanced Gray Scale
        gray: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#eeeeee',
          300: '#e0e0e0',
          400: '#bdbdbd',
          500: '#9e9e9e',
          600: '#757575',
          700: '#616161',
          800: '#424242',
          850: '#303030',
          900: '#212121',
          950: '#0a0a0a',
        },
      },
      spacing: {
        // Section Spacing
        'section-y': 'clamp(4rem, 8vw, 6rem)',
        'section-x': 'clamp(1rem, 4vw, 5rem)',
        // Card Spacing
        'card-padding': 'clamp(1rem, 3vw, 1.5rem)',
        // Component Gaps
        'gap-sm': 'clamp(0.375rem, 1vw, 0.5rem)',
        'gap-md': 'clamp(0.75rem, 2vw, 1rem)',
        'gap-lg': 'clamp(1rem, 3vw, 1.5rem)',
      },
      scale: {
        'x-150': '1.5',
        // Hover Effects
        'hover-sm': '1.02',
        'hover-md': '1.05',
        'hover-lg': '1.1',
      },
      fontSize: {
        '9xl': '9rem',
        // Responsive Typography Scale
        'display-xl': 'clamp(2.5rem, 8vw, 4.5rem)',
        'display-lg': 'clamp(2rem, 6vw, 3.5rem)',
        'display-md': 'clamp(1.5rem, 4vw, 2.5rem)',
        'heading-lg': 'clamp(1.25rem, 3vw, 1.875rem)',
        'heading-md': 'clamp(1.125rem, 2.5vw, 1.5rem)',
        'body-lg': 'clamp(1rem, 2vw, 1.125rem)',
        'body-md': 'clamp(0.875rem, 1.5vw, 1rem)',
        'caption': 'clamp(0.75rem, 1.25vw, 0.875rem)',
      },
      borderRadius: {
        // Component Border Radius Scale
        'card': 'clamp(0.5rem, 1.5vw, 0.75rem)',
        'card-lg': 'clamp(0.75rem, 2vw, 1rem)',
        'button': '0.5rem',
        'element': '0.375rem',
      },
      boxShadow: {
        // Elevation System
        'elevation-low': '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
        'elevation-medium': '0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)',
        'elevation-high': '0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23)',
        'elevation-highest': '0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22)',
        'glow-primary': '0 0 20px rgba(255, 215, 0, 0.3)',
        'glow-secondary': '0 0 20px rgba(0, 255, 252, 0.3)',
      },
      opacity: {
        '15': '0.15',
        '35': '0.35',
        '65': '0.65',
        '85': '0.85',
      },
      zIndex: {
        'negative': '-1',
        'ground': '0',
        'low': '10',
        'medium': '20',
        'high': '30',
        'highest': '40',
        'overlay': '50',
      },
      transitionDuration: {
        '250': '250ms',
        '400': '400ms',
        '600': '600ms',
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
        slideRight: "slideRight 0.5s ease-in-out",
        slideLeft: "slideLeft 0.5s ease-in-out",
      },
    },
  },
  plugins: [],
};

export default config;