import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register PWA Service Worker for offline library and prayer times
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  try {
    registerSW({
      immediate: true,
      onOfflineReady() {
        console.log('Al_HikMah is ready to work offline');
      },
      onRegisterError(error) {
        console.warn('PWA service worker registration notice:', error);
      },
    });
  } catch (swErr) {
    console.warn('PWA registration notice in current frame:', swErr);
  }
}

createRoot(document.getElementById('root')!).render(<App />);
