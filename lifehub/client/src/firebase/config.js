import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getAnalytics } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: "AIzaSyCgKpP6v0uahwnigtUwExINwywwowSXqp8",
  authDomain: "life-hub-a14e6.firebaseapp.com",
  projectId: "life-hub-a14e6",
  storageBucket: "life-hub-a14e6.firebasestorage.app",
  messagingSenderId: "127124276805",
  appId: "1:127124276805:web:abec413a2732d41e5a852c",
  measurementId: "G-4LPPY79XK6"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const analytics = getAnalytics(app)
export default app