import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMasterAuth } from '../../../hooks/useRedux';
import BackButton from '../../common/BackButton';
import './MasterAdminSignupForm.css';

const MasterAdminSignupForm = ({ onSignupComplete }) => {
  const navigate = useNavigate();
  const { signup } = useMasterAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    mobilePhone: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Mobile phone validation
    const phoneRegex = /^(\+20|0)?1[0-9]{9}$/;
    if (!formData.mobilePhone) {
      newErrors.mobilePhone = 'Mobile phone is required';
    } else if (!phoneRegex.test(formData.mobilePhone.replace(/\s/g, ''))) {
      newErrors.mobilePhone = 'Please enter a valid Egyptian mobile number';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password = 'Password must contain both uppercase and lowercase letters';
    } else if (!/(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await signup(formData.email, formData.mobilePhone, formData.password);
      if (result.success) {
        // Call the callback to notify parent that signup is complete
        if (onSignupComplete) {
          onSignupComplete();
        }
      } else {
        setErrors({ general: result.message || 'Signup failed. Please try again.' });
      }
    } catch (error) {
      setErrors({ general: 'An error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="master-signup-page">
      <div className="master-signup-container">
        <div className="signup-card">
          <div className="signup-header">
            <h1>Master Admin Setup</h1>
            <p>Create your master administrator account</p>
          </div>

          <div className="setup-notice-card">
            <div className="notice-icon">⚠️</div>
            <div className="notice-content">
              <strong>One-time Setup:</strong>
              <p>This form will only appear once. Please save your credentials securely.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="signup-form">
            {errors.general && (
              <div className="error-message">
                {errors.general}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? 'error' : ''}
                placeholder="admin@ahmedothmangroup.com"
                autoComplete="username"
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="mobilePhone">Mobile Phone *</label>
              <input
                type="tel"
                id="mobilePhone"
                name="mobilePhone"
                value={formData.mobilePhone}
                onChange={handleInputChange}
                className={errors.mobilePhone ? 'error' : ''}
                placeholder="+20 100 123 4567"
                autoComplete="tel"
              />
              {errors.mobilePhone && <span className="error-text">{errors.mobilePhone}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={errors.password ? 'error' : ''}
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  👁️
                </button>
              </div>
              {errors.password && <span className="error-text">{errors.password}</span>}
              <div className="password-requirements">
                <small>Password must contain at least 6 characters, uppercase, lowercase, and a number</small>
              </div>
            </div>

            <button 
              type="submit" 
              className="signup-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <div className="signup-footer">
            <div className="signup-links">
              <BackButton 
                text="← Back to Admin Portal"
                onClick={() => navigate('/admin')}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MasterAdminSignupForm;
