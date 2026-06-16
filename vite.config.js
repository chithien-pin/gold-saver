import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const SHEETS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbweCyrU5njzy38octPH8a7QvIR8h3UrKcY21KPz7k_RyaAQqM0SXEJDFzoHtANUykCy3w/exec'
const SHEETS_PATH = new URL(SHEETS_SCRIPT_URL).pathname
const GOLD_GRAPHQL_PATH = '/api/graphql'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/sheets': {
        target: 'https://script.google.com',
        changeOrigin: true,
        // Đơn giản: chỉ map đường dẫn, giữ nguyên query (?sheet=GoldMom)
        rewrite: (path) => path.replace(/^\/api\/sheets/, SHEETS_PATH),
      },
      '/api/gold-rates': {
        target: 'https://baotinmanhhai.vn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/gold-rates/, GOLD_GRAPHQL_PATH),
      },
    },
  },
})
