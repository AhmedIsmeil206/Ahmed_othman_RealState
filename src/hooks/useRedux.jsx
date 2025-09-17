import { useSelector, useDispatch } from 'react-redux';
import {
  initializeMasterAuth,
  signupMasterAdmin,
  loginMasterAdmin,
  updateMasterProfile,
  logout,
  clearError,
  selectMasterAuth,
  selectCurrentUser,
  selectMasterLoading,
  selectMasterError,
  selectIsMasterAuthenticated,
  selectIsFirstTimeSetup,
  selectCurrentUserProfile
} from '../store/slices/masterAuthSlice';

export const useMasterAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector(selectMasterAuth);
  const currentUser = useSelector(selectCurrentUser);
  const isLoading = useSelector(selectMasterLoading);
  const error = useSelector(selectMasterError);
  const isAuthenticated = useSelector(selectIsMasterAuthenticated);
  const isFirstTimeSetup = useSelector(selectIsFirstTimeSetup);
  const userProfile = useSelector(selectCurrentUserProfile);

  const initialize = async () => {
    const result = await dispatch(initializeMasterAuth());
    return result.meta.requestStatus === 'fulfilled';
  };

  const signup = async (email, phone, password) => {
    try {
      // Extract full name from email (before @ symbol) as a fallback
      const full_name = email.split('@')[0].replace(/[^a-zA-Z\s]/g, ' ').trim() || 'Master Admin';
      
      const result = await dispatch(signupMasterAdmin({
        full_name,
        email,
        phone,
        password
      }));
      
      if (signupMasterAdmin.fulfilled.match(result)) {
        return { success: true, message: 'Master admin account created successfully' };
      } else {
        return { success: false, message: result.payload || 'Signup failed' };
      }
    } catch (error) {
      return { success: false, message: 'An error occurred during signup' };
    }
  };

  const login = async (email, password) => {
    try {
      const result = await dispatch(loginMasterAdmin({ email, password }));
      
      if (loginMasterAdmin.fulfilled.match(result)) {
        return { success: true };
      } else {
        return { success: false, message: result.payload || 'Login failed' };
      }
    } catch (error) {
      return { success: false, message: 'An error occurred during login' };
    }
  };

  const updateProfile = async (email, currentPassword, newPassword) => {
    try {
      const result = await dispatch(updateMasterProfile({
        email,
        currentPassword,
        newPassword
      }));
      
      if (updateMasterProfile.fulfilled.match(result)) {
        return { success: true, message: 'Profile updated successfully' };
      } else {
        return { success: false, message: result.payload || 'Update failed' };
      }
    } catch (error) {
      return { success: false, message: 'An error occurred during update' };
    }
  };

  const logoutUser = () => {
    dispatch(logout());
  };

  const clearAuthError = () => {
    dispatch(clearError());
  };

  return {
    // State
    auth,
    currentUser,
    userProfile,
    isLoading,
    error,
    isAuthenticated,
    isFirstTimeSetup,
    
    // Actions
    initialize,
    signup,
    login,
    updateProfile,
    logout: logoutUser,
    clearError: clearAuthError
  };
};

// Re-export other hooks
export { useAdminManagement } from './useAdminManagement';
export { usePropertyManagement } from './usePropertyManagement';
export { useAdminAuth } from './useAdminAuth';
export { useRentalContracts } from './useRentalContracts';
export { useDashboardData } from './useDashboardData';

// Legacy property hook for backward compatibility - using new API-integrated version
export { usePropertyManagement as useProperty } from './usePropertyManagement';