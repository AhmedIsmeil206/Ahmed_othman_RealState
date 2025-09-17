import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMasterAuth } from '../../../hooks/useRedux';
import BackButton from '../../common/BackButton';
import MasterAdminSignupForm from '../MasterAdminSignupForm/MasterAdminSignupForm';
import heroImg from '../../../assets/images/backgrounds/LP.jpg';
import './MasterAdminLoginForm.css';

const MasterAdminLoginForm = () => {
  const navigate = useNavigate();
  const { login, isFirstTimeSetup, initialize } = useMasterAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSignupForm, setShowSignupForm] = useState(false);

  // Initialize app and check if first-time setup is needed
  useEffect(() => {
    initialize();
    setShowSignupForm(isFirstTimeSetup);
  }, [initialize, isFirstTimeSetup]);

  const handleSignupComplete = () => {
    // After successful signup, hide signup form and show login form
    setShowSignupForm(false);
    // Navigate to dashboard since user is already logged in after signup
    navigate('/master-admin/dashboard');
  };

  // If it's first-time setup, show signup form
  if (showSignupForm) {
    return <MasterAdminSignupForm onSignupComplete={handleSignupComplete} />;
  }

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

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
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
      const result = await login(formData.email, formData.password);
      if (result.success) {
        navigate('/master-admin/dashboard');
      } else {
        setErrors({ general: result.message || 'Invalid email or password' });
      }
    } catch (error) {
      setErrors({ general: 'An error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="master-login-container">
      <div className="master-login-background">
        <div className="master-login-overlay">
          <div className="master-login-content">
            
            <div className="master-login-form-wrapper">
              <BackButton 
                text=" Back to Admin Portal"
                onClick={() => navigate('/admin')}
                variant="transparent"
              />
              
              <div className="master-login-header">
                <h1>Master Admin Login</h1>
                <p>Access the complete studio management system</p>
              </div>

              <form className="master-login-form" onSubmit={handleSubmit}>
                {errors.general && (
                  <div className="error-message general-error">
                    {errors.general}
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={errors.email ? 'error' : ''}
                    placeholder="Enter your email address"
                    autoComplete="username"
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={errors.password ? 'error' : ''}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                    />
                    <div className="password-toggle">
                      <input
                        type="checkbox"
                        id="showPassword"
                        checked={showPassword}
                        onChange={(e) => setShowPassword(e.target.checked)}
                      />
                      <label htmlFor="showPassword">Show Password</label>
                    </div>
                  </div>
                  {errors.password && <span className="error-message">{errors.password}</span>}
                </div>

                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing In...' : 'Login'}
                </button>

                <BackButton 
                  text=" Back to Admin Portal"
                  onClick={() => navigate('/admin')}
                  variant="link"
                />

                
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MasterAdminLoginForm;
