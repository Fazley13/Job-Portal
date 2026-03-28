import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2015' // Force older JS syntax
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2015'
    }
  }
})