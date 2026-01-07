import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';
import logoImg from '../assets/logo.png';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    barangay: '',
    contact: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Register Submitted:', formData);
  };

  return (
    <div className="auth-container">
      <div className="brand-section">
        <img src={logoImg} alt="Project Alerto" className="brand-logo-img" />
        {}
        <p className="brand-subtitle">Marikeños Preparedness Hub</p>
      </div>

      <div className="auth-card">
        <h2 className="auth-header">Create Account</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="fullName" className="form-label">Full Name</label>
            <input 
              type="text" 
              id="fullName"
              name="fullName"
              className="form-input" 
              onChange={handleChange}
              required
            />
            <p className="form-helper">Password must be at least 8 characters</p>

          </div>

          <div className="form-group">
            <label htmlFor="barangay" className="form-label">Barangay</label>
            <select 
              id="barangay"
              name="barangay" 
              className="form-input" 
              onChange={handleChange}
              defaultValue=""
              required
            >
              <option value="" disabled>Select Barangay</option>
              <option value="Barangka">Barangka</option>
              <option value="Calumpang">Calumpang</option>
              <option value="Concepcion Dos">Concepcion Dos</option>
              <option value="Concepcion Uno">Concepcion Uno</option>
              <option value="Fortune">Fortune</option>
              <option value="Industrial Valley Complex">Industrial Valley Complex</option>
              <option value="Jesus Dela Peña">Jesus Dela Peña</option>
              <option value="Malanday">Malanday</option>
              <option value="Marikina Heights">Marikina Heights</option>
              <option value="Nangka">Nangka</option>
              <option value="Parang">Parang</option>
              <option value="San Roque">San Roque</option>
              <option value="Santa Elena">Santa Elena</option>
              <option value="Santo Niño">Santo Niño</option>
              <option value="Tañong">Tañong</option>
              <option value="Tumana">Tumana</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="contact" className="form-label">Mobile Number</label>
            <input 
              type="tel" 
              id="contact"
              name="contact"
              placeholder="0912 345 6789"
              className="form-input" 
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input 
              type="password" 
              id="password"
              name="password"
              className="form-input" 
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="auth-btn">Sign Up</button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login" className="auth-link">Login here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;