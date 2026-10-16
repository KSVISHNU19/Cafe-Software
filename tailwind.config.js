/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        espresso: {
          900: "#241710",
          DEFAULT: "#3B261B",
          light: "#4A3023",
        },
        coffee: {
          dark: "#4A3023",
          DEFAULT: "#6F4E37",
          medium: "#8D674A",
          light: "#B08968",
          caramel: "#C68B59",
        },
        cream: {
          DEFAULT: "#F5EBDD",
          light: "#FAF4EC",
          dark: "#EADCC9",
          muted: "#DCC8AF",
        },
        milk: "#FFFDF8",
        brandDark: "#2C211B",
        brandMuted: "#7C6A5D",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        heading: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        subtle: "0 2px 10px rgba(59, 38, 27, 0.04)",
        card: "0 4px 20px -2px rgba(59, 38, 27, 0.07)",
        elevated: "0 10px 30px -5px rgba(59, 38, 27, 0.12)",
      },
    },
  },
  plugins: [],
};
