/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#f0f2f9',
        foreground: '#2d3250',
        card: {
          DEFAULT: '#ffffff',
          foreground: '#2d3250',
        },
        muted: {
          DEFAULT: '#e8eaf6',
          foreground: '#8b90a8',
        },
        primary: {
          DEFAULT: '#5c67f2',
          foreground: '#ffffff',
          light: '#c3c7f9',
          dark: '#3d4494',
        },
        accent: {
          DEFAULT: '#eef0ff',
          foreground: '#3d4494',
        },
        coral: {
          DEFAULT: '#f4a27e',
          soft: '#fde8dc',
        },
        lavender: {
          DEFAULT: '#c3c7f9',
          soft: '#eef0ff',
        },
        border: '#e4e7f4',
        destructive: '#e57373',
        success: '#5bb98c',
        surface: '#e8eaf6',
      },
      borderRadius: {
        'card': '12px',
        'panel': '16px',
      },
      fontFamily: {
        sans: ['Urbanist', 'system-ui', 'sans-serif'],
        display: ['Urbanist', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'spin-slow': 'spin 1s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'card': '0 10px 40px rgba(92, 103, 242, 0.08), 0 2px 8px rgba(45, 50, 80, 0.04)',
        'soft': '0 10px 40px rgba(92, 103, 242, 0.08), 0 2px 8px rgba(45, 50, 80, 0.04)',
        'soft-lg': '0 10px 40px rgba(92, 103, 242, 0.08), 0 2px 8px rgba(45, 50, 80, 0.04)',
        'primary': '0 0 0 1px rgba(92, 103, 242, 0.2)',
      },
    },
  },
  plugins: [],
}
