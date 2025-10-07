import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getAnalytics } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCgKpP6v0uahwnigtUwExINwywwowSXqp8",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "life-hub-a14e6.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "life-hub-a14e6",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "life-hub-a14e6.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "127124276805",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:127124276805:web:abec413a2732d41e5a852c",
  measurementId: "G-4LPPY79XK6"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const analytics = getAnalytics(app)
export default app