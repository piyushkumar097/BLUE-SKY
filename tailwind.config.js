/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          sky: '#0284C7',     // deep sky-blue
          skyDark: '#0369A1',
          skyLight: '#E0F2FE',
          midnight: '#0F172A', // midnight slate
          amber: '#F59E0B',    // warm amber
          amberDark: '#D97706',
          amberLight: '#FEF3C7',
          surface: '#F8FAFC',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounce 2s infinite',
      }
    },
  },
  plugins: [],
}
