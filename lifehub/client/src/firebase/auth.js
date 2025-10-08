import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  GoogleAuthProvider, 
  signInWithPopup,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth'
import { auth } from './config'

// Email/Password Authentication
export const loginWithEmail = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password)
    return { user: result.user, error: null }
  } catch (error) {
    return { user: null, error: error.message }
  }
}

export const signupWithEmail = async (email, password, displayName) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    if (displayName) {
      await updateProfile(result.user, { displayName })
    }
    return { user: result.user, error: null }
  } catch (error) {
    return { user: null, error: error.message }
  }
}

// Google Authentication
export const loginWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({
      prompt: 'select_account'
    })
    
    const result = await signInWithPopup(auth, provider)
    return { user: result.user, error: null }
  } catch (error) {
    console.error('Google login error:', error)
    let errorMessage = 'Google sign-in failed. Please try again.'
    
    if (error.code === 'auth/popup-closed-by-user') {
      errorMessage = 'Sign-in cancelled.'
    } else if (error.code === 'auth/popup-blocked') {
      errorMessage = 'Popup blocked. Please allow popups and try again.'
    } else if (error.code === 'auth/unauthorized-domain') {
      errorMessage = `Domain not authorized. Current domain: ${window.location.hostname}. Please contact support.`
    } else if (error.code === 'auth/operation-not-allowed') {
      errorMessage = 'Google sign-in is not enabled. Please use email/password.'
    }
    
    return { user: null, error: errorMessage }
  }
}

// Password Reset
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email)
    return { success: true, error: null }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Logout
export const logout = async () => {
  try {
    await signOut(auth)
    return { success: true, error: null }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Auth State Observer
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback)
}