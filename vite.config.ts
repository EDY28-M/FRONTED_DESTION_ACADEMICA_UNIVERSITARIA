import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Usar localhost en desarrollo para que Vite proxyee las peticiones al backend
    // que corre localmente sin Docker.
    host: 'localhost',
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5251',
        changeOrigin: true,
        secure: false
      },
      '/hub': {
        target: 'ws://localhost:5251',
        changeOrigin: true,
        secure: false,
        ws: true // Habilitar WebSocket para SignalR
      }
    }
  }
})
