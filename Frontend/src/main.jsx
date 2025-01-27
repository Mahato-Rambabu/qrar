import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import './index.css';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swUrl = `${window.location.origin}/service-worker.js`;

    navigator.serviceWorker
      .register(swUrl)
      .then((registration) => {
        console.log('Service Worker registered successfully:', registration);

        // Listen for updates to the service worker
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          console.log('A new service worker is being installed:', installingWorker);

          installingWorker.onstatechange = () => {
            console.log('Service worker state changed to:', installingWorker.state);

            if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('New content is available; please refresh.');
            } else if (installingWorker.state === 'activated') {
              console.log('Service worker is activated and running.');
            }
          };
        };
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