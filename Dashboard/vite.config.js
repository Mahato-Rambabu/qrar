import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  root: ".", // Ensure Vite looks in the project root for index.html
  server: {
    open: true,
  },
})
