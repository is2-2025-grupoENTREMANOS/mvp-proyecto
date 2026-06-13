import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // El proxy solo aplica en dev local — en Vercel usa VITE_API_URL directo
  server: {
    port: 5173,
  },
  build: {
    outDir: 'dist',
  },
})