import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const SHEETS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbxfBs22bi-JueYnz-uifHfmgkZ-AwxowtCelQYw-Nw-05zxJwNa1jc4M6dfKcEh5N5oGg/exec'
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
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/gold-rates/, GOLD_GRAPHQL_PATH),
      },
    },
  },
})
