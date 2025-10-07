import React, { useState } from "react";
import { signupWithEmail } from "../firebase/auth";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { user, error: authError } = await signupWithEmail(email, password, username);
    if (user) {
      navigate("/dashboard");
    } else {
      if (authError.includes('email-already-in-use')) {
        setError('Email address is already registered');
      } else if (authError.includes('weak-password')) {
        setError('Password should be at least 6 characters');
      } else if (authError.includes('invalid-email')) {
        setError('Invalid email address');
      } else {
        setError('Registration failed. Please try again.');
      }
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>LifeHub</h1>
          <h2>Create Account</h2>
          <p>Start your productivity journey</p>
        </div>
        <form onSubmit={handleRegister} className="auth-form">
          <div className="form-group">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
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
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
          {error && <div className="error-message">{error}</div>}
        </form>
        <div className="auth-switch">
          <p>
            Already have an account? <Link to="/" className="switch-btn">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
