import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://45.144.177.53:8000/',
        changeOrigin: true,
      },
    },
  },
})