import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './ResetPassword.css';
import logoImg from '../assets/logo.png';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validSession, setValidSession] = useState(false);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user came from a valid reset link
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Check URL for recovery token
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const type = hashParams.get('type');
      
      if (type === 'recovery' && accessToken) {
        setValidSession(true);
      } else if (session) {
        setValidSession(true);
      }
      
      setChecking(false);
    };

    checkSession();

    // Listen for auth state changes (for when user clicks the reset link)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setValidSession(true);
        setChecking(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) throw updateError;

      setSuccess(true);
      
      // Sign out after password reset
      await supabase.auth.signOut();
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset password. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (checking) {
    return (
      <div className="auth-container">
        <div className="brand-section">
          <img src={logoImg} alt="Project Alerto" className="brand-logo-img" />
          <p className="brand-subtitle">Marikeños Preparedness Hub</p>
        </div>

        <div className="auth-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="loading-spinner-small"></div>
          <p style={{ marginTop: '1rem', color: '#64748b' }}>Verifying reset link...</p>
        </div>
      </div>
    );
  }

  // Invalid or expired link
  if (!validSession && !checking) {
    return (
      <div className="auth-container">
        <div className="brand-section">
          <img src={logoImg} alt="Project Alerto" className="brand-logo-img" />
          <p className="brand-subtitle">Marikeños Preparedness Hub</p>
        </div>

        <div className="auth-card success-card">
          <div className="success-icon-wrapper">
            <div className="success-icon error-icon">
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
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M15 9l-6 6"></path>
                <path d="M9 9l6 6"></path>
              </svg>
            </div>
          </div>

          <h2 className="success-title">Invalid Reset Link</h2>

          <p className="success-text">
            This password reset link is invalid or has expired. Please request a new one.
          </p>

          <Link to="/forgot-password" className="auth-btn success-btn">
            Request New Link
          </Link>

          <div className="auth-footer" style={{ marginTop: '1rem' }}>
            <p>
              <Link to="/login" className="auth-link">Back to Login</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Success screen
  if (success) {
    return (
      <div className="auth-container">
        <div className="brand-section">
          <img src={logoImg} alt="Project Alerto" className="brand-logo-img" />
          <p className="brand-subtitle">Marikeños Preparedness Hub</p>
        </div>

        <div className="auth-card success-card">
          <div className="success-icon-wrapper">
            <div className="success-icon">
              <svg 
                width="36" 
                height="36" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="white" 
                strokeWidth="3" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
          </div>

          <h2 className="success-title">Password Reset!</h2>

          <p className="success-text">
            Your password has been successfully reset. You can now log in with your new password.
          </p>

          <div className="reset-info-box">
            <svg 
              width="18" 
              height="18" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#22c55e" 
              strokeWidth="2"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            <span>Redirecting to login page...</span>
          </div>

          <Link to="/login" className="auth-btn success-btn">
            Go to Login Now
          </Link>
        </div>
      </div>
    );
  }

  // Reset password form
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
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
          </div>
          <h2 className="auth-header">Reset Password</h2>
          <p className="forgot-subtitle">
            Enter your new password below. Make sure it's at least 8 characters long.
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
            <label htmlFor="new-password" className="form-label">New Password</label>
            <input
              id="new-password"
              type="password"
              name="password"
              className="form-input"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              autoComplete="new-password"
              data-lpignore="true"
              required
              minLength={8}
            />
            <p className="form-helper">Must be at least 8 characters</p>
          </div>

          <div className="form-group">
            <label htmlFor="confirm-password" className="form-label">Confirm Password</label>
            <input
              id="confirm-password"
              type="password"
              name="confirmPassword"
              className="form-input"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError('');
              }}
              autoComplete="new-password"
              data-lpignore="true"
              required
              minLength={8}
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            <Link to="/login" className="auth-link">Back to Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
