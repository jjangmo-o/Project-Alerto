import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Auth.css';
import logoImg from '../assets/logo.png';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    contact: '',
    address: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const { register } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await register(formData);
      setRegistrationSuccess(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Show success screen after registration - compact version
  if (registrationSuccess) {
    return (
      <div className="auth-container">
        <div className="brand-section">
          <img src={logoImg} alt="Project Alerto" className="brand-logo-img" />
          <p className="brand-subtitle">Marikeños Preparedness Hub</p>
        </div>

        <div className="auth-card success-card">
          {/* Success Icon */}
          <div className="success-icon">
            <svg 
              width="32" 
              height="32" 
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

          <h2 className="success-title">Registration Successful!</h2>

          <p className="success-text">
            Welcome, <strong>{formData.firstName}</strong>!
          </p>

          <div className="email-notice">
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
              <rect x="2" y="4" width="20" height="16" rx="2"></rect>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
            </svg>
            <div>
              <p className="email-main">Check your email</p>
              <p className="email-sub">{formData.email}</p>
            </div>
          </div>

          <Link to="/login" className="auth-btn" style={{ display: 'block', textDecoration: 'none', textAlign: 'center' }}>
            Go to Login
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
        <h2 className="auth-header">Create Account</h2>

        {error && <p className="form-error" style={{ textAlign: 'center', marginBottom: '1rem', color: '#dc2626' }}>{error}</p>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-row" style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="firstName" className="form-label">First Name</label>
              <input 
                type="text" 
                id="firstName"
                name="firstName"
                className="form-input"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="lastName" className="form-label">Last Name</label>
              <input 
                type="text" 
                id="lastName"
                name="lastName"
                className="form-input"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input 
              type="email" 
              id="email"
              name="email"
              placeholder="you@example.com"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="contact" className="form-label">Mobile Number</label>
            <input 
              type="tel" 
              id="contact"
              name="contact"
              placeholder="0912 345 6789"
              className="form-input"
              value={formData.contact}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="address" className="form-label">Address (Optional)</label>
            <input 
              type="text" 
              id="address"
              name="address"
              placeholder="Your complete address"
              className="form-input"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input 
              type="password" 
              id="password"
              name="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
            />
            <p className="form-helper">Password must be at least 8 characters</p>
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login" className="auth-link">Login here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;