import { useSelector, useDispatch } from 'react-redux';
import { authApi, adminApi, handleApiError } from '../services/api';
import {
  setLoading,
  setError,
  clearError,
  loginSuccess,
  loginFailure,
  logout as logoutAction,
  selectAdminAuth,
  selectCurrentAdmin,
  selectAdminLoading,
  selectAdminError,
  selectIsAdminAuthenticated,
  selectAllAdminAccounts
} from '../store/slices/adminAuthSlice';

export const useAdminAuth = () => {
  const dispatch = useDispatch();
  const adminAuth = useSelector(selectAdminAuth);
  const currentAdmin = useSelector(selectCurrentAdmin);
  const isLoading = useSelector(selectAdminLoading);
  const error = useSelector(selectAdminError);
  const isAuthenticated = useSelector(selectIsAdminAuthenticated);
  const allAdminAccounts = useSelector(selectAllAdminAccounts);

  // Transform API admin data to frontend format
  const transformAdminFromApi = (apiAdmin) => ({
    id: apiAdmin.id,
    username: apiAdmin.full_name,
    name: apiAdmin.full_name,
    account: apiAdmin.email,
    email: apiAdmin.email,
    phone: apiAdmin.phone,
    mobileNumber: apiAdmin.phone,
    mobile: apiAdmin.phone,
    role: apiAdmin.role,
    isActive: apiAdmin.is_active !== false,
    createdAt: apiAdmin.created_at || new Date().toISOString(),
    updatedAt: apiAdmin.updated_at || new Date().toISOString(),
    loginTime: new Date().toISOString()
  });

  // Admin login with API
  const loginAdmin = async (accountOrMobileOrEmail, password) => {
    try {
      dispatch(setLoading(true));
      
      // Login through API
      await authApi.login(accountOrMobileOrEmail, password);
      
      // Get current admin info
      const adminData = await adminApi.getMe();
      const transformedAdmin = transformAdminFromApi(adminData);
      
      dispatch(loginSuccess({ admin: transformedAdmin }));
      return { success: true, admin: transformedAdmin };
    } catch (error) {
      const errorMessage = handleApiError(error, 'Invalid credentials');
      dispatch(loginFailure(errorMessage));
      return { success: false, message: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Admin logout
  const logoutAdmin = () => {
    authApi.logout(); // Clear API token
    dispatch(logoutAction());
  };

  // Check admin authentication status
  const checkAuthStatus = async () => {
    try {
      if (authApi.isAuthenticated()) {
        const adminData = await adminApi.getMe();
        const transformedAdmin = transformAdminFromApi(adminData);
        dispatch(loginSuccess({ admin: transformedAdmin }));
        return { success: true, admin: transformedAdmin };
      }
      return { success: false, message: 'Not authenticated' };
    } catch (error) {
      const errorMessage = handleApiError(error, 'Authentication check failed');
      dispatch(loginFailure(errorMessage));
      return { success: false, message: errorMessage };
    }
  };

  // Initialize admin auth on app start
  const initializeAdminAuth = async () => {
    try {
      if (authApi.isAuthenticated()) {
        return await checkAuthStatus();
      }
      return { success: false, message: 'No active session' };
    } catch (error) {
      console.error('Admin auth initialization error:', error);
      return { success: false, message: 'Initialization failed' };
    }
  };

  // Clear admin error
  const clearAdminError = () => {
    dispatch(clearError());
  };

  // Legacy compatibility methods
  const createAdminAccount = async (adminData) => {
    try {
      // This would typically be handled by the admin management hook
      // but keeping for compatibility
      const response = await adminApi.create({
        full_name: adminData.name || adminData.username,
        email: adminData.email || adminData.account,
        phone: adminData.phone || adminData.mobileNumber || adminData.mobile,
        role: adminData.role || 'studio_rental',
        password: adminData.password
      });
      
      return { 
        success: true, 
        message: 'Admin account created successfully',
        admin: transformAdminFromApi(response)
      };
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to create admin account');
      return { success: false, message: errorMessage };
    }
  };

  const getAllAdminAccounts = () => {
    // This now returns the local state, but could be enhanced to fetch from API
    return allAdminAccounts;
  };

  const updateAdminStatus = async (adminId, isActive) => {
    try {
      await adminApi.update(adminId, { is_active: isActive });
      return { success: true, message: `Admin ${isActive ? 'activated' : 'deactivated'} successfully` };
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to update admin status');
      return { success: false, message: errorMessage };
    }
  };

  const deleteAdminAccount = async (adminId) => {
    try {
      await adminApi.delete(adminId);
      return { success: true, message: 'Admin account deleted successfully' };
    } catch (error) {
      const errorMessage = handleApiError(error, 'Failed to delete admin account');
      return { success: false, message: errorMessage };
    }
  };

  return {
    // State
    adminAuth,
    currentAdmin,
    isLoading,
    error,
    isAuthenticated,
    allAdminAccounts,
    
    // Actions
    loginAdmin,
    logoutAdmin,
    checkAuthStatus,
    initializeAdminAuth,
    clearError: clearAdminError,
    
    // Legacy compatibility
    createAdminAccount,
    getAllAdminAccounts,
    updateAdminStatus,
    deleteAdminAccount
  };
};