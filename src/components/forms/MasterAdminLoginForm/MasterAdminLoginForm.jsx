import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMasterAuth } from '../../../hooks/useRedux';
import { loginMasterAdmin } from '../../../store/slices/masterAuthSlice';
import BackButton from '../../common/BackButton';
import MasterAdminSignupForm from '../MasterAdminSignupForm/MasterAdminSignupForm';
import './MasterAdminLoginForm.css';

const MasterAdminLoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isFirstTimeSetup, initialize, isAuthenticated, isLoading: authLoading } = useMasterAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSignupForm, setShowSignupForm] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize app and check if first-time setup is needed
  useEffect(() => {
    const initializeApp = async () => {
      if (initialize && typeof initialize === 'function') {
        try {
          await initialize();
        } catch (error) {
          console.error('Initialization error:', error);
        } finally {
          setIsInitializing(false);
        }
      } else {
        setIsInitializing(false);
      }
    };
    initializeApp();
  }, [initialize]);

  // Update signup form visibility when isFirstTimeSetup changes
  useEffect(() => {
    if (isFirstTimeSetup) {
      setShowSignupForm(true);
    } else {
      setShowSignupForm(false);
    }
  }, [isFirstTimeSetup]);

  // Handle authentication state changes - only redirect after successful login
  useEffect(() => {
    // Only redirect if user is authenticated AND we're not showing signup form
    if (isAuthenticated && !showSignupForm && !isFirstTimeSetup) {
      const searchParams = new URLSearchParams(location.search);
      const originalPath = searchParams.get('path');
      
      // If they were trying to access a specific path, redirect there
      if (originalPath && originalPath !== '/master-admin/login') {
        navigate(originalPath, { replace: true });
      } else {
        navigate('/master-admin/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, showSignupForm, isFirstTimeSetup, navigate, location.search]);

  // Check if user came from protected route and handle back navigation
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const from = searchParams.get('from');
    
    // If this was accessed directly (not from protected route), no special handling needed
    if (!from) return;
    
    // Set up a timeout to detect if user might have used back button
    const backButtonTimer = setTimeout(() => {
      // If user is still on login page after a short delay and came from protected route,
      // they might have used back button - provide clear navigation
      if (location.pathname === '/master-admin/login' && from === 'protected') {
        // User can click the back button component to go to admin portal
      }
    }, 100);
    
    return () => clearTimeout(backButtonTimer);
  }, [location.pathname, location.search]);

  const handleSignupComplete = async () => {
    // After successful signup, refresh initialization to get updated state
    setShowSignupForm(false);
    
    // Re-initialize to check the updated first-time setup status
    if (initialize && typeof initialize === 'function') {
      try {
        await initialize();
      } catch (error) {
        console.error('Re-initialization error:', error);
      }
    }
  };

  // Show loading spinner while initializing
  if (isInitializing || authLoading) {
    return (
      <div className="login-container">
        <div className="login-overlay">
          <div className="login-card">
            <div className="text-center">
              <div className="loading-spinner"></div>
              <p>Initializing...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
      const resultAction = await login({ email: formData.email, password: formData.password });
      
      if (loginMasterAdmin.fulfilled.match(resultAction)) {
        // Success - navigate to dashboard
        navigate('/master-admin/dashboard');
      } else if (loginMasterAdmin.rejected.match(resultAction)) {
        // Failed - show error
        setErrors({ general: resultAction.payload || 'Invalid email or password' });
      }
    } catch (error) {
      console.error('Login error:', error);
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
                  text="← Back to Admin Portal"
                  onClick={() => navigate('/admin', { replace: true })}
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
