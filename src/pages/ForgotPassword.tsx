import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';
import './Auth.css';
import logoImg from '../assets/logo.png';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authService.resetPassword(email);
      setEmailSent(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send reset email. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Success screen after email is sent
  if (emailSent) {
    return (
      <div className="auth-container">
        <div className="brand-section">
          <img src={logoImg} alt="Project Alerto" className="brand-logo-img" />
          <p className="brand-subtitle">Marikeños Preparedness Hub</p>
        </div>

        <div className="auth-card success-card">
          <div className="success-icon-wrapper">
            <div className="success-icon email-sent-icon">
              <svg 
                width="36" 
                height="36" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="white" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
              </svg>
            </div>
          </div>

          <h2 className="success-title">Check Your Email</h2>

          <p className="success-text">
            We've sent a password reset link to:
          </p>

          <div className="email-notice">
            <div className="email-icon-wrapper">
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="#f38020" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </div>
            <div className="email-content">
              <p className="email-main">{email}</p>
              <p className="email-hint">Click the link in the email to reset your password</p>
            </div>
          </div>

          <div className="reset-info-box">
            <svg 
              width="18" 
              height="18" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#64748b" 
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 16v-4"></path>
              <path d="M12 8h.01"></path>
            </svg>
            <span>Didn't receive the email? Check your spam folder or try again.</span>
          </div>

          <button 
            className="auth-btn secondary-btn" 
            onClick={() => setEmailSent(false)}
          >
            Try Another Email
          </button>

          <Link to="/login" className="auth-btn success-btn">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="brand-section">
        <img src={logoImg} alt="Project Alerto" className="brand-logo-img" />
        <p className="brand-subtitle">Marikeños Preparedness Hub</p>
      </div>

      <div className="auth-card">
        <div className="forgot-header">
          <div className="forgot-icon-wrapper">
            <svg 
              width="32" 
              height="32" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#0d2b5b" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <h2 className="auth-header">Forgot Password?</h2>
          <p className="forgot-subtitle">
            No worries! Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

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
            <label htmlFor="reset-email" className="form-label">Email Address</label>
            <input
              id="reset-email"
              type="email"
              name="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              autoComplete="off"
              data-lpignore="true"
              required
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Remember your password? <Link to="/login" className="auth-link">Back to Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
