import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Cargar variables de entorno
  const env = loadEnv(mode, process.cwd(), '')
  // Usar VITE_BACKEND_URL si está definida, sino usar localhost por defecto
  const backendUrl = env.VITE_BACKEND_URL || 'http://localhost:5251'

  return {
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
          target: backendUrl,
          changeOrigin: true,
          secure: false
        },
        '/hub': {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
          ws: true // Habilitar WebSocket para SignalR
        }
      }
    }
  }
})

