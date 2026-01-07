import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Usar localhost en desarrollo para que Vite proxyee las peticiones al backend
    // que corre localmente sin Docker.
    host: 'localhost',
    port: 3000,
    // Permitir acceder al dev-server desde ngrok (evita: "This host is not allowed")
    // Nota: el prefijo puede cambiar en cada ejecución de ngrok.
    allowedHosts: [
      'kiara-unascendant-trustingly.ngrok-free.dev',
      '.ngrok-free.dev'
    ],
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
