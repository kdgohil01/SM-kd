/**
 * Firebase Configuration and Initialization
 * 
 * Import the functions you need from the SDKs you need
 */

import { initializeApp, getApps } from 'firebase/app';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBSAhoZbpnqtG2C5wMJnmoPhRZqgVXwT0Y",
  authDomain: "odoo-x-spit.firebaseapp.com",
  projectId: "odoo-x-spit",
  storageBucket: "odoo-x-spit.firebasestorage.app",
  messagingSenderId: "582666973042",
  appId: "1:582666973042:web:a867fee84f0620a69277eb",
  measurementId: "G-YT4XTHZLLW"
};

// Initialize Firebase (only if not already initialized)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Analytics (only in browser environment and if supported)
let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {
    // Analytics not supported, continue without it
  });
}

// Initialize Auth
export const auth = getAuth(app);

// Connect to Auth emulator in development (only if not in production)
if (import.meta.env.DEV && window.location.hostname === 'localhost') {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
  } catch (error) {
    // Emulator already connected, ignore
  }
}

export { analytics };
export default app;

