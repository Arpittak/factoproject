import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Any request that starts with "/api" will be forwarded
      '/api': {
        target: 'http://localhost:5000', // The address of your backend server
        changeOrigin: true,
      },
    },
    // Add allowedHosts here, directly under the 'server' object
    allowedHosts: [
      '4e6ab24fe94d.ngrok-free.app', // Replace with your current ngrok URL
      'localhost',
      '127.0.0.1',
    ],
  }
})