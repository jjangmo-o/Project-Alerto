import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';
import logoImg from '../assets/logo.png';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login Submitted:', formData);
  };

  return (
    <div className="auth-container">
      <div className="brand-section">
        <img src={logoImg} alt="Project Alerto" className="brand-logo-img" />
        {}
        <p className="brand-subtitle">Marikeños Preparedness Hub</p>
      </div>

      <div className="auth-card">
        <h2 className="auth-header">Sign In</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input 
              type="text" 
              name="username"
              className="form-input" 
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              name="password"
              className="form-input" 
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="auth-btn">Login</button>
        </form>

        <div className="auth-footer">
          <p style={{marginBottom: '10px'}}>Forgot password? <span className="auth-link">click here</span></p>
          <p>
            No account? <Link to="/register" className="auth-link">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;