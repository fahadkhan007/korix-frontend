import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePageLoading } from '../context/LoadingContext';
import { authService } from '../api/auth';
import './Login.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { loginState } = useAuth();
  const { start, done } = usePageLoading();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    start();
    setError('');

    try {
      const { accessToken, refreshToken, user } = await authService.login({ email, password });
      loginState(user, accessToken, refreshToken);
      navigate('/dashboard');
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || 'An error occurred during sign in.'
      );
    } finally {
      setLoading(false);
      done();
    }
  };

  return (
    <div className="auth-layout">
      <div className="login-card-container">
        <div className="login-brand">
          <div className="auth-logo">K</div>
          <h2 className="brand-name">Korix</h2>
          <p className="brand-subtitle">Sign in to orchestrate your projects.</p>
        </div>

        <div className="card login-card">
          <form onSubmit={handleLogin} className="login-form">
            {error && <div className="error-message">{error}</div>}
            
            <div className="input-group">
              <label htmlFor="email" className="input-label">Email Address</label>
              <input 
                id="email" 
                type="email" 
                className="input-field" 
                placeholder="you@company.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="input-group">
              <div className="label-wrapper">
                <label htmlFor="password" className="input-label">Password</label>
                <a href="#" className="forgot-link">Forgot password?</a>
              </div>
              <input 
                id="password" 
                type="password" 
                className="input-field" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>
          
          <div className="login-footer">
            <p className="footer-text">
              Don't have an account? <Link to="/register" className="register-link">Request Access</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
