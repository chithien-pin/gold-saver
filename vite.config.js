import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const SHEETS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbzPWngdu72Q2Ge2xHRNZUmQlszrc3smRI0qEeiti7FqCNGt9ibsaqpTgTGiB7QvFgLj3g/exec'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/sheets': {
        target: SHEETS_SCRIPT_URL,
        changeOrigin: true,
        rewrite: (path) => new URL(SHEETS_SCRIPT_URL).pathname,
      },
    },
  },
})
