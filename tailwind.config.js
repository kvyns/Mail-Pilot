/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./index.html"],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#ecfdfb',
          100: '#d1faf4',
          200: '#a7f3eb',
          300: '#6ee7dc',
          400: '#3fd0c6',
          500: '#2bb5ad',
          600: '#1f9a94',
          700: '#1b7c77',
          800: '#195f5c',
          900: '#134645',
        },
        neutral: {
          50:  '#f8fcfc',
          100: '#eef6f6',
          200: '#ddeaea',
          300: '#c3d6d6',
          400: '#9fbcbc',
          500: '#7a9c9c',
          600: '#5c7f7f',
          700: '#466363',
          800: '#324848',
          900: '#1f2f2f',
        },
        accent: {
          50:  '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
    },
  },
  plugins: [],
}
