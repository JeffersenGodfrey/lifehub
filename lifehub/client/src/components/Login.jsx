import React, { useState } from "react";
import { loginWithEmail, loginWithGoogle } from "../firebase/auth";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { user, error: authError } = await loginWithEmail(email, password);
    if (user) {
      navigate("/dashboard");
    } else {
      if (authError.includes('user-not-found') || authError.includes('invalid-email')) {
        setError('Invalid email address');
      } else if (authError.includes('wrong-password') || authError.includes('invalid-credential')) {
        setError('Invalid password');
      } else {
        setError('Invalid email or password');
      }
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const { user, error: authError } = await loginWithGoogle();
      if (user) {
        navigate("/dashboard");
      } else {
        console.error('Google sign-in error:', authError);
        if (authError.includes('popup-closed-by-user')) {
          setError('Sign-in cancelled. Please try again.');
        } else if (authError.includes('popup-blocked')) {
          setError('Popup blocked. Please allow popups and try again.');
        } else {
          setError('Google sign-in failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      setError('Google sign-in failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>LifeHub</h1>
          <h2>Welcome Back!</h2>
          <p>Sign in to continue your journey</p>
        </div>
        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="auth-btn primary" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
          {error && <div className="error-message">{error}</div>}
        </form>
        <div className="divider">
          <span>or</span>
        </div>
        <button 
          type="button" 
          className="google-btn"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>
        <div className="auth-switch">
          <p>
            Don't have an account? <Link to="/register" className="switch-btn">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
