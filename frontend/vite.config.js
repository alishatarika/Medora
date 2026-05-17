import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Videos and static assets — served by FastAPI at /static
  // publicDir not needed since we proxy /static to backend
  server: {
    port: 5173,
    proxy: {
      '/auth':      'http://localhost:8000',
      '/medicines': 'http://localhost:8000',
      '/doctors':   'http://localhost:8000',
      '/orders':    'http://localhost:8000',
      '/chatbot':   'http://localhost:8000',
      '/sos':       'http://localhost:8000',
      '/static':    'http://localhost:8000',   // videos & thumbnails from FastAPI
      '/admin': {
        target: 'http://localhost:8000',
        bypass: (req) => {
          if (req.headers.accept?.includes('text/html')) return req.url
        }
      },
    }
  }
})
