import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import './index.css';

// Dynamically determine the service worker path based on environment
const isLocalhost = window.location.hostname === 'localhost';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swUrl = isLocalhost
      ? '/service-worker.js' // For localhost
      : `${window.location.origin}/service-worker.js`; // For production

    navigator.serviceWorker
      .register(swUrl)
      .then((registration) => {
        console.log('Service Worker registered successfully:', registration);
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Toaster position="top-center" reverseOrder={false} />
  </StrictMode>
);
