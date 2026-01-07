import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Auth.css';
import logoImg from '../assets/logo.png';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed. Please check your credentials.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="brand-section">
        <img src={logoImg} alt="Project Alerto" className="brand-logo-img" />
        <p className="brand-subtitle">Marikeños Preparedness Hub</p>
      </div>

      <div className="auth-card">
        <h2 className="auth-header">Sign In</h2>

        {error && (
          <div className="error-box">
            <svg 
              width="18" 
              height="18" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#dc2626" 
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M15 9l-6 6"></path>
              <path d="M9 9l6 6"></path>
            </svg>
            <span>{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              className="form-input"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              autoComplete="off"
              data-lpignore="true"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input 
              id="password"
              type="password"
              name="password"
              className="form-input" 
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              data-lpignore="true"
              required
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <div className="auth-footer">
          <p style={{marginBottom: '10px'}}>
            Forgot password? <Link to="/forgot-password" className="auth-link">Click here</Link>
          </p>
          <p>
            No account? <Link to="/register" className="auth-link">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;