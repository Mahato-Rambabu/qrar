import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

// Progressive Enhancement based on service worker support
if ('serviceWorker' in navigator) {
  const swUrl = `${window.location.origin}/service-worker.js`;
  
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(swUrl)
      .then(registration => {
        console.log('SW registered:', registration);
        
        // Periodic updates check (every 2 hours)
        setInterval(() => {
          registration.update().catch(err => 
            console.log('SW update check failed:', err));
        }, 7200000);
      })
      .catch(error => {
        console.error('SW registration failed:', error);
      });
  });

  // Handle controller changes
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload();
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Toaster position='top-center' toastOptions={{ duration: 3000 }} />
  </StrictMode>
);