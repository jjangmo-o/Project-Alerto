import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Register.css';
import logoImg from '../assets/logo.png';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    contact: '',
    address: '',
    birthDay: '',
    birthMonth: '',
    birthYear: '',
    gender: '',
    password: ''
  });
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const { register } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React. ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Profile picture must be less than 5MB');
        return;
      }
      if (!file.type. startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const removeProfilePicture = (e: React.MouseEvent) => {
    e.stopPropagation();
    setProfilePicture(null);
    setProfilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current. value = '';
    }
  };

  const generateDays = () => {
    const days = [];
    for (let i = 1; i <= 31; i++) {
      days.push(i. toString().padStart(2, '0'));
    }
    return days;
  };

  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 10; i >= currentYear - 100; i--) {
      years.push(i.toString());
    }
    return years;
  };

  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label:  'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value:  '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!profilePicture) {
      setError('Please upload a profile picture');
      setLoading(false);
      return;
    }

    if (!formData.birthDay || !formData.birthMonth || !formData.birthYear) {
      setError('Please select your complete birth date');
      setLoading(false);
      return;
    }

    try {
      const birthDate = `${formData.birthYear}-${formData.birthMonth}-${formData.birthDay}`;
      const submitData = {
        ... formData,
        birthDate,
        profilePicture
      };
      await register(submitData);
      setRegistrationSuccess(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message :  'Registration failed.  Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (registrationSuccess) {
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

          <h2 className="success-title">Registration Successful!</h2>

          <p className="success-text">
            Welcome to Project Alerto, <strong>{formData.firstName}</strong>!
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
                <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
              </svg>
            </div>
            <div className="email-content">
              <p className="email-main">Please verify your email</p>
              <p className="email-sub">{formData.email}</p>
              <p className="email-hint">Check your inbox for the confirmation link</p>
            </div>
          </div>

          <Link to="/login" className="auth-btn success-btn">
            Continue to Login
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

        {error && <p style={{ textAlign: 'center', marginBottom: '1rem', color: '#dc2626', fontSize: '0.85rem' }}>{error}</p>}
        
        <form onSubmit={handleSubmit} autoComplete="off">
          {/* Profile Picture Upload */}
          <div className="profile-upload-section">
            <div className="profile-upload-wrapper">
              <div className="profile-upload-circle">
                {profilePreview ? (
                  <img src={profilePreview} alt="Profile preview" className="profile-preview-img" />
                ) : (
                  <div className="profile-upload-placeholder">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1. 5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                )}
              </div>
              {profilePreview ?  (
                <button 
                  type="button" 
                  className="remove-profile-btn"
                  onClick={removeProfilePicture}
                  aria-label="Remove profile picture"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              ) : (
                <button 
                  type="button"
                  className="upload-icon-btn"
                  onClick={handleUploadClick}
                  aria-label="Upload profile picture"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleProfilePictureChange}
              accept="image/*"
              className="hidden-file-input"
            />
            <p className="profile-upload-label">Upload Profile Picture <span className="required-asterisk">*</span></p>
          </div>

          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="firstName" className="form-label">First Name</label>
              <input 
                type="text" 
                id="firstName"
                name="firstName"
                className="form-input"
                value={formData.firstName}
                onChange={handleChange}
                autoComplete="off"
                data-lpignore="true"
                required
              />
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="middleName" className="form-label">Middle Name</label>
              <input 
                type="text" 
                id="middleName"
                name="middleName"
                className="form-input"
                placeholder="Optional"
                value={formData.middleName}
                onChange={handleChange}
                autoComplete="off"
                data-lpignore="true"
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
                autoComplete="off"
                data-lpignore="true"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="email" className="form-label">Email</label>
              <input 
                type="email" 
                id="email"
                name="email"
                placeholder="you@example.com"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
                autoComplete="off"
                data-lpignore="true"
                required
              />
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="gender" className="form-label">Gender</label>
              <select
                id="gender"
                name="gender"
                className={`form-input form-select ${formData.gender ?  'has-value' : ''}`}
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="" disabled hidden>Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Birthdate</label>
            <div className="birthdate-row">
              <select
                name="birthMonth"
                className={`form-input form-select birthdate-select ${formData.birthMonth ? 'has-value' : ''}`}
                value={formData.birthMonth}
                onChange={handleChange}
                required
              >
                <option value="" disabled hidden>Month</option>
                {months. map(month => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
              <select
                name="birthDay"
                className={`form-input form-select birthdate-select ${formData.birthDay ? 'has-value' :  ''}`}
                value={formData.birthDay}
                onChange={handleChange}
                required
              >
                <option value="" disabled hidden>Day</option>
                {generateDays().map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
              <select
                name="birthYear"
                className={`form-input form-select birthdate-select ${formData.birthYear ? 'has-value' : ''}`}
                value={formData. birthYear}
                onChange={handleChange}
                required
              >
                <option value="" disabled hidden>Year</option>
                {generateYears().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
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
              autoComplete="off"
              data-lpignore="true"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="address" className="form-label">Address</label>
            <input 
              type="text" 
              id="address"
              name="address"
              placeholder="Your complete address"
              className="form-input"
              value={formData.address}
              onChange={handleChange}
              autoComplete="off"
              data-lpignore="true"
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
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              data-lpignore="true"
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