import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

function getHttpsCert() {
  try {
    // Exportar certificado dev de ASP.NET a PEM
    const certDir = path.join(process.cwd(), '.cert')
    if (!fs.existsSync(certDir)) fs.mkdirSync(certDir, { recursive: true })
    const certPath = path.join(certDir, 'localhost.pem')
    const keyPath = path.join(certDir, 'localhost.key')
    if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
      execSync(`dotnet dev-certs https --export-path "${certPath}" --format Pem --no-password`, { stdio: 'ignore' })
    }
    if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
      return { cert: certPath, key: keyPath }
    }
  } catch { /* fallback sin HTTPS */ }
  return undefined
}

export default defineConfig(({ mode }) => {
  // Cargar variables de entorno
  const env = loadEnv(mode, process.cwd(), '')
  // Usar VITE_BACKEND_URL si está definida, sino usar localhost por defecto
  const backendUrl = env.VITE_BACKEND_URL || 'https://localhost:5251'

  const https = getHttpsCert()

  return {
    plugins: [react()],
    server: {
      host: 'localhost',
      port: 3000,
      https,
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

