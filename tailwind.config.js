/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'custom-gradient': 'linear-gradient(to bottom, #D7E9B9 0%, #C1E6B3 13%, #4F96BF 100%)',
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        customPink: '#F58787',
        customOrange: '#FAA84B',
        customWhite: '#FFE3E3',
        customGreen: '#65C847',
        customBlue: '#4F96BF',
      },
    },
  },
  plugins: [],
};
