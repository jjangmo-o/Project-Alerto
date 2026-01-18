import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Register.css';
import logoImg from '../assets/logo.png';

const getPasswordStrength = (password: string) => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { label: 'Weak', level: 1 };
  if (score === 2) return { label: 'Fair', level: 2 };
  if (score === 3) return { label: 'Good', level: 3 };
  return { label: 'Strong', level: 4 };
};

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
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const { register } = useAuth();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const generateDays = () =>
    Array.from({ length: 31 }, (_, i) =>
      (i + 1).toString().padStart(2, '0')
    );

  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 91 }, (_, i) =>
      (currentYear - 10 - i).toString()
    );
  };

  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  const passwordStrength = getPasswordStrength(formData.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Check for incomplete details
    const requiredFields = [
      'firstName', 'lastName', 'email', 'contact', 'address',
      'birthDay', 'birthMonth', 'birthYear', 'gender', 'password', 'confirmPassword'
    ];
    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        setError('Please fill in all required fields.');
        setLoading(false);
        return;
      }
    }

    // Phone number validation: must be 11 digits, start with 09, and only numbers
    const phone = formData.contact.replace(/\s+/g, '');
    if (!/^09\d{9}$/.test(phone)) {
      setError('Please enter a valid 11-digit mobile number starting with 09.');
      setLoading(false);
      return;
    }

    if (!formData.birthDay || !formData.birthMonth || !formData.birthYear) {
      setError('Please select your complete birth date');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const birthDate = `${formData.birthYear}-${formData.birthMonth}-${formData.birthDay}`;

      await register({
        firstName: formData.firstName,
        middleName: formData.middleName || undefined,
        lastName: formData.lastName,
        gender: formData.gender,
        email: formData.email,
        contact: phone,
        address: formData.address,
        birthDate,
        password: formData.password,
      });

      setRegistrationSuccess(true);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Registration failed. Please try again.'
      );
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
          <h2 className="success-title">Registration Successful!</h2>
          <p className="success-text">
            Welcome to Project Alerto, <strong>{formData.firstName}</strong>!
          </p>
          <p className="email-hint">
            Please verify your email before logging in.
          </p>

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

        {error && (
          <p style={{ textAlign: 'center', color: '#dc2626', fontSize: '0.85rem' }}>
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} autoComplete="off">
          {/* NAME */}
          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">First Name</label>
              <input name="firstName" className="form-input" value={formData.firstName} onChange={handleChange} required />
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Middle Name</label>
              <input name="middleName" className="form-input" placeholder="Optional" value={formData.middleName} onChange={handleChange} />
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Last Name</label>
              <input name="lastName" className="form-input" value={formData.lastName} onChange={handleChange} required />
            </div>
          </div>

          {/* EMAIL & GENDER */}
          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Email</label>
              <input type="email" name="email" className="form-input" value={formData.email} onChange={handleChange} required />
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Gender</label>
              <select name="gender" className={`form-input form-select ${formData.gender ? 'has-value' : ''}`} value={formData.gender} onChange={handleChange} required>
                <option value="" disabled hidden>Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>
          </div>

          {/* BIRTHDATE */}
          <div className="form-group">
            <label className="form-label">Birthdate</label>
            <div className="birthdate-row">
              <select name="birthMonth" className="form-input form-select" value={formData.birthMonth} onChange={handleChange} required>
                <option value="" disabled hidden>Month</option>
                {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>

              <select name="birthDay" className="form-input form-select" value={formData.birthDay} onChange={handleChange} required>
                <option value="" disabled hidden>Day</option>
                {generateDays().map(d => <option key={d} value={d}>{d}</option>)}
              </select>

              <select name="birthYear" className="form-input form-select" value={formData.birthYear} onChange={handleChange} required>
                <option value="" disabled hidden>Year</option>
                {generateYears().map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          {/* MOBILE */}
          <div className="form-group">
            <label className="form-label">Mobile Number</label>
            <input name="contact" className="form-input" placeholder="0912 345 6789" value={formData.contact} onChange={handleChange} required />
          </div>

          {/* ADDRESS */}
          <div className="form-group">
            <label className="form-label">Address</label>
            <input name="address" className="form-input" placeholder="Your complete address" value={formData.address} onChange={handleChange} required />
          </div>

          {/* PASSWORD */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" name="password" className="form-input" value={formData.password} onChange={handleChange} required />
            {formData.password && (
              <>
                <div
                  className={`password-meter ${
                    passwordStrength.label === 'Weak'
                      ? 'weak'
                      : passwordStrength.label === 'Fair'
                      ? 'medium'
                      : 'strong'
                  }`}
                >
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
                <div
                  className={`password-text ${
                    passwordStrength.label === 'Weak'
                      ? 'weak'
                      : passwordStrength.label === 'Fair'
                      ? 'medium'
                      : 'strong'
                  }`}
                >
                  {passwordStrength.label}
                </div>
              </>
            )}

          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input type="password" name="confirmPassword" className="form-input" value={formData.confirmPassword} onChange={handleChange} required />
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
