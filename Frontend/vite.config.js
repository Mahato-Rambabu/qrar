import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@context': path.resolve(__dirname, 'src/Context'),
    },
  },
  server: {
    proxy: {
      '/api': 'https://qrar.onrender.com',
    },
  },
});