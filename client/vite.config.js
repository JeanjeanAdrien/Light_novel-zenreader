import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // 1. Pour permettre l'accès via l'URL ngrok
    allowedHosts: [
      '.ngrok-free.app'
    ],
    // 2. Proxy pour rediriger les requêtes /api vers le backend local
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})