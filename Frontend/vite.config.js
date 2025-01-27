import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
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
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'), // Entry point for the app
        serviceWorker: path.resolve(__dirname, 'service-worker.js'), // Ensure service worker is included
      },
    },
  },
  publicDir: 'public', // Ensures static files (like service-worker.js) are copied to the build output
});