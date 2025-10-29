import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";

// Global error handlers
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Register service worker for PWA (only on main pages, not payment pages)
if ('serviceWorker' in navigator) {
  // Check if we're on a main page
  const isMainPage = window.location.pathname === '/' || 
                     window.location.pathname === '/services' ||
                     window.location.pathname.startsWith('/create/');
  
  if (isMainPage) {
    // Register immediately, don't wait for load
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then((registration) => {
        console.log('SW registered for main pages:', registration);
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('New SW available');
              }
            });
          }
        });
        
        // Update service worker when page becomes visible
        document.addEventListener('visibilitychange', () => {
          if (!document.hidden) {
            registration.update();
          }
        });
      })
      .catch((error) => {
        console.log('SW registration failed:', error);
        // Don't block app if SW fails
      });
  } else {
    // Unregister service worker on payment pages
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        registration.unregister().then(() => {
          console.log('SW unregistered on payment page');
        });
      });
    });
  }
}

// Initialize app with error handling
const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error('Root element not found!');
  throw new Error('Root element not found');
}

try {
  createRoot(rootElement).render(
    <HelmetProvider>
      <App />
    </HelmetProvider>
  );
} catch (error) {
  console.error('Failed to render app:', error);
  rootElement.innerHTML = `
    <div style="padding: 20px; text-align: center; font-family: sans-serif;">
      <h1>خطأ في تحميل التطبيق</h1>
      <p>يرجى تحديث الصفحة</p>
      <button onclick="window.location.reload()" style="padding: 10px 20px; margin-top: 10px;">
        إعادة التحميل
      </button>
    </div>
  `;
}
