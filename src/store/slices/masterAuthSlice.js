import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi, adminApi, handleApiError } from '../../services/api';
import masterAuthService from '../../services/masterAuthService';

// Initial state
const initialState = {
  currentUser: null,
  isLoading: false,
  error: null,
  initialized: false
};

// Master auth slice
const masterAuthSlice = createSlice({
  name: 'masterAuth',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.currentUser = null;
      state.error = null;
      authApi.logout(); // Clear API token
    },
    initializeApp: (state) => {
      if (!state.initialized) {
        state.initialized = true;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginMasterAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginMasterAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUser = {
          id: action.payload.user.id,
          email: action.payload.user.email,
          full_name: action.payload.user.full_name,
          phone: action.payload.user.phone,
          role: action.payload.user.role,
          loginTime: action.payload.loginTime,
          authMethod: action.payload.authMethod,
          sessionId: action.payload.sessionId,
          lastActivity: new Date().toISOString()
        };
        state.initialized = true;
        console.log('✅ Redux: Master admin state updated successfully', {
          userId: state.currentUser.id,
          sessionId: state.currentUser.sessionId
        });
      })
      .addCase(loginMasterAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.currentUser = null;
      })
      
      // Update Profile
      .addCase(updateMasterProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateMasterProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.currentUser) {
          state.currentUser = {
            ...state.currentUser,
            email: action.payload.user.email,
            full_name: action.payload.user.full_name,
            phone: action.payload.user.phone,
            lastUpdated: new Date().toISOString()
          };
        }
      })
      .addCase(updateMasterProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

// Export actions
export const {
  setLoading,
  setError,
  clearError,
  logout,
  initializeApp
} = masterAuthSlice.actions;

// Async thunks for API integration
export const initializeMasterAuth = createAsyncThunk(
  'masterAuth/initialize',
  async (_, { rejectWithValue }) => {
    try {
      if (authApi.isAuthenticated()) {
        const adminResponse = await adminApi.getMe();
        
        return {
          currentUser: {
            id: adminResponse.id,
            email: adminResponse.email,
            full_name: adminResponse.full_name,
            phone: adminResponse.phone,
            role: adminResponse.role,
            loginTime: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
          },
          isFirstTimeSetup: false
        };
      }
      
      // Check if master admin exists
      try {
        await authApi.checkMasterAdminExists();
        return { currentUser: null, isFirstTimeSetup: false };
      } catch (error) {
        if (error.status === 404) {
          return { currentUser: null, isFirstTimeSetup: true };
        }
        throw error;
      }
    } catch (error) {
      return rejectWithValue({
        message: error.message || 'Initialization failed',
        status: error.status
      });
    }
  }
);

// Enhanced master admin authentication using comprehensive validation service
export const loginMasterAdmin = createAsyncThunk(
  'masterAuth/login',
  async (loginData, { rejectWithValue }) => {
    try {
      const { email, username, password } = loginData;
      const identifier = email || username; // Use either email or username (phone)
      
      console.log('📊 Redux: Initiating master admin authentication via service...');
      
      // Use the comprehensive authentication service
      const authResult = await masterAuthService.authenticateMasterAdmin({
        identifier,
        password
      });
      
      if (authResult.success) {
        console.log('✅ Redux: Master admin authentication service completed successfully');
        return {
          user: authResult.user,
          authMethod: authResult.authMethod,
          sessionId: authResult.sessionId,
          loginTime: authResult.loginTime
        };
      } else {
        throw new Error('Authentication service failed');
      }
      
    } catch (error) {
      console.error('❌ Redux: Master admin authentication failed:', error.message);
      
      // Ensure clean state on failure
      masterAuthService.logout();
      
      return rejectWithValue(error.message || 'Authentication failed. Please try again.');
    }
  }
);

export const updateMasterProfile = createAsyncThunk(
  'masterAuth/updateProfile',
  async ({ email, currentPassword, newPassword }, { getState, rejectWithValue }) => {
    try {
      const { masterAuth } = getState();
      
      if (!masterAuth.currentUser) {
        return rejectWithValue('Not authenticated');
      }
      
      // Build targeted update data - only send fields that are being changed
      const updateData = {};
      
      // For email updates: only send email
      if (email !== masterAuth.currentUser.email) {
        const emailToUpdate = email.toLowerCase().trim();
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailToUpdate)) {
          return rejectWithValue('Please enter a valid email address');
        }
        
        updateData.email = emailToUpdate;
      }
      
      // For password updates: only send password  
      if (newPassword && newPassword.trim().length > 0) {
        updateData.password = newPassword.trim();
      }
      
      // Validate that we have something to update
      if (Object.keys(updateData).length === 0) {
        return rejectWithValue('No changes detected');
      }
      
      // Remove undefined/null/empty values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined || updateData[key] === null || updateData[key] === '') {
          delete updateData[key];
        }
      });
      
      console.log('🔄 Updating master admin profile via PUT /admins/me');
      console.log('📝 Current user:', { 
        id: masterAuth.currentUser.id,
        full_name: masterAuth.currentUser.full_name,
        email: masterAuth.currentUser.email,
        phone: masterAuth.currentUser.phone 
      });
      console.log('📝 Target email:', email);
      console.log('📝 Has password update:', !!newPassword);
      console.log('📝 Update data to send:', { ...updateData, password: updateData.password ? '[REDACTED]' : undefined });
      console.log('📝 Update data keys:', Object.keys(updateData));
      
      // Use the correct API endpoint: PUT /admins/me
      // Note: Backend doesn't validate currentPassword for this endpoint
      const updatedUser = await adminApi.updateMe(updateData);
      
      console.log('✅ Profile updated successfully:', updatedUser);
      
      return { user: updatedUser };
    } catch (error) {
      console.error('❌ Profile update failed:', error);
      console.error('❌ Error status:', error.status);
      console.error('❌ Error data:', error.data);
      
      // Enhanced error logging for validation errors
      if (error.status === 422) {
        console.error('❌ Validation errors:', error.getValidationErrors?.());
        console.error('❌ Raw validation data:', error.data?.detail);
        
        // Log each validation error in detail
        if (Array.isArray(error.data?.detail)) {
          error.data.detail.forEach((validationError, index) => {
            console.error(`❌ Validation Error ${index + 1}:`, {
              field: validationError.loc?.[validationError.loc.length - 1],
              location: validationError.loc,
              message: validationError.msg,
              type: validationError.type,
              input: validationError.input
            });
          });
        }
      }
      
      const errorMessage = handleApiError(error, 'Update failed. Please try again.');
      console.error('❌ Processed error message:', errorMessage);
      
      return rejectWithValue(errorMessage);
    }
  }
);

// Selectors
export const selectMasterAuth = (state) => state.masterAuth;
export const selectCurrentUser = (state) => state.masterAuth.currentUser;
export const selectMasterLoading = (state) => state.masterAuth.isLoading;
export const selectMasterError = (state) => state.masterAuth.error;
export const selectIsMasterAuthenticated = (state) => !!state.masterAuth.currentUser && authApi.isAuthenticated();
export const selectIsFirstTimeSetup = (state) => state.masterAuth.isFirstTimeSetup;

export const selectCurrentUserProfile = (state) => {
  const { currentUser } = state.masterAuth;
  if (!currentUser) return null;
  
  return {
    id: currentUser.id,
    email: currentUser.email,
    full_name: currentUser.full_name,
    phone: currentUser.phone,
    role: currentUser.role,
    loginTime: currentUser.loginTime,
    lastUpdated: currentUser.lastUpdated
  };
};

export default masterAuthSlice.reducer;