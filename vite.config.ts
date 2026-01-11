import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: 'localhost',
    port: 3000,
    // Permitir acceso desde ngrok y render
    allowedHosts: [
      'kiara-unascendant-trustingly.ngrok-free.dev',
      '.ngrok-free.dev',
      '.onrender.com'
    ],
    proxy: {
      '/api': {
        target: 'https://gestion-academica-api.onrender.com',
        changeOrigin: true,
        secure: true
      },
      '/hub': {
        target: 'wss://gestion-academica-api.onrender.com',
        changeOrigin: true,
        secure: true,
        ws: true // Habilitar WebSocket para SignalR
      }
    }
  }
})

