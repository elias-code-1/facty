import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Intercepter globalement l'erreur de Refresh Token de Supabase
// qui peut être lancée en arrière-plan par le timer de rafraîchissement
window.addEventListener('unhandledrejection', (event) => {
  const msg = event.reason?.message || '';
  if (msg.includes('Refresh Token Not Found') || msg.includes('invalid_refresh_token') || msg.includes('Invalid Refresh Token')) {
    event.preventDefault(); // Empêche l'erreur de s'afficher dans la console
    // On pourrait forcer la déconnexion ici, mais useAuth s'en charge déjà
  }
});

// Désactiver les logs en production pour plus de sécurité
if (import.meta.env.PROD) {
  console.log = () => {};
  console.error = () => {};
  console.warn = () => {};
  console.info = () => {};
  console.debug = () => {};
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
