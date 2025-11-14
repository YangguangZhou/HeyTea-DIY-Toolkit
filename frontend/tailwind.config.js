/** @type {import(''tailwindcss'').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f3f4ff',
          100: '#e7e9ff',
          200: '#c5c8ff',
          300: '#a1a5ff',
          400: '#7f84ff',
          500: '#5c62ff',
          600: '#4549cc',
          700: '#323599',
          800: '#1f2266',
          900: '#0d0f33'
        }
      }
    }
  },
  plugins: []
};
