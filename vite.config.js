import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://jqxgqsopz8.execute-api.eu-west-2.amazonaws.com/prod/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: true,
      },
      '/upload-api': {
        target: 'https://m4t4jr1ic5.execute-api.eu-west-2.amazonaws.com/prod/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/upload-api/, ''),
        secure: true,
      },
      '/payment-api': {
        target: 'https://nfmv69lv4j.execute-api.eu-west-2.amazonaws.com/prod/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/payment-api/, ''),
        secure: true,
      }
    }
  }
})
