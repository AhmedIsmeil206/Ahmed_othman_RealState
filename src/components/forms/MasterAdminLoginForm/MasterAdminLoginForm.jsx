import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMasterAuth } from '../../../hooks/useRedux';
import { loginMasterAdmin } from '../../../store/slices/masterAuthSlice';
import BackButton from '../../common/BackButton';
import './MasterAdminLoginForm.css';

const MasterAdminLoginForm = () => {
  const navigate = useNavigate();
  const { login } = useMasterAuth();
  
  const [formData, setFormData] = useState({
    emailOrPhone: '', // Accept both email and mobile phone
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Only redirect after successful login (not on mount)

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

    // Email or Mobile phone validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^(\+20|0)?1[0-9]{9}$/;
    
    if (!formData.emailOrPhone) {
      newErrors.emailOrPhone = 'Email or mobile phone is required';
    } else if (!emailRegex.test(formData.emailOrPhone) && !phoneRegex.test(formData.emailOrPhone.replace(/\s/g, ''))) {
      newErrors.emailOrPhone = 'Please enter a valid email address or Egyptian mobile number';
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
    console.log('🔐 Starting Master Admin Login...', { emailOrPhone: formData.emailOrPhone });

    try {
      // Determine if input is email or phone
      const isEmail = formData.emailOrPhone.includes('@');
      const loginData = {
        [isEmail ? 'email' : 'username']: formData.emailOrPhone, // Backend expects 'username' for phone
        password: formData.password
      };
      
      console.log('📤 Sending login data to API:', { 
        [isEmail ? 'email' : 'username']: loginData[isEmail ? 'email' : 'username'], 
        password: '[HIDDEN]' 
      });
      
      const resultAction = await login(loginData);
      
      if (loginMasterAdmin.fulfilled.match(resultAction)) {
        console.log('✅ Master Admin Login Successful!', resultAction.payload);
        // Success - redirect to dashboard only after successful login
        navigate('/master-admin/dashboard', { replace: true });
      } else if (loginMasterAdmin.rejected.match(resultAction)) {
        console.error('❌ Master Admin Login Failed:', resultAction.payload);
        // Failed - show error
        setErrors({ general: resultAction.payload || 'Invalid credentials' });
      }
    } catch (error) {
      console.error('💥 Login error:', error);
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
                <p>Sign in with your email or mobile phone</p>
              </div>

              <form className="master-login-form" onSubmit={handleSubmit}>
                {errors.general && (
                  <div className="error-message general-error">
                    {errors.general}
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="emailOrPhone">Email or Mobile Phone</label>
                  <input
                    type="text"
                    id="emailOrPhone"
                    name="emailOrPhone"
                    value={formData.emailOrPhone}
                    onChange={handleInputChange}
                    className={errors.emailOrPhone ? 'error' : ''}
                    placeholder="Enter your email or mobile phone"
                    autoComplete="username"
                  />
                  {errors.emailOrPhone && <span className="error-message">{errors.emailOrPhone}</span>}
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
