import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi, adminApi, handleApiError } from '../../services/api';

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
          loginTime: new Date().toISOString()
        };
        state.initialized = true;
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

// Only export login thunk, remove signup
export const loginMasterAdmin = createAsyncThunk(
  'masterAuth/login',
  async (loginData, { rejectWithValue }) => {
    try {
      const { email, username, password } = loginData;
      const identifier = email || username; // Use either email or username (phone)
      
      console.log('📊 Redux: Master admin login attempt with:', { identifier: identifier, type: email ? 'email' : 'phone' });
      
      // Login to get access token using static database credentials
      console.log('🔗 API Call: POST /auth/login');
      await authApi.login(identifier, password);
      console.log('✅ Login API call successful');
      
      // Get current user info from static database
      console.log('🔗 API Call: GET /admins/me');
      const user = await adminApi.getMe();
      console.log('✅ Master admin profile retrieved from database:', user);
      
      // Verify user is master admin role
      if (user.role !== 'super_admin' && user.role !== 'master_admin') {
        throw new Error('Access denied: Master admin role required');
      }
      
      return { user };
    } catch (error) {
      console.error('❌ Master admin login failed:', error);
      const errorMessage = error.message || 'Invalid credentials';
      return rejectWithValue(errorMessage);
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
      
      const updateData = {
        email: email.toLowerCase().trim()
      };
      
      if (newPassword && newPassword.trim().length > 0) {
        updateData.password = newPassword;
      }
      
      const updatedUser = await adminApi.update(masterAuth.currentUser.id, updateData);
      
      return { user: updatedUser };
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Update failed. Please try again.'));
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