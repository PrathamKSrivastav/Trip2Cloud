import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Directs any call to /api to our Python server
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      // Serves thumbnails directly from the backend
      '/thumbnails': 'http://localhost:8000',
      // Handles the heavy image/video streaming
      '/stream': 'http://localhost:8000'
    }
  }
})