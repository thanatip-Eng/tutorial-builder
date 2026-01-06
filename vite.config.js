import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/tutorial-builder/',
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
