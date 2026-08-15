import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8082,
    proxy: {
      '/api/vehicles': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/vehicles/, '/api/v1/vehicles')
      },
      '/api/mobility': {
        target: 'http://localhost:8103',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/mobility/, '/api/v1/mobility')
      }
    }
  }
})