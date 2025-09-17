import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi, adminApi, handleApiError } from '../../services/api';

// Initial state
const initialState = {
  currentUser: null,
  isLoading: false,
  error: null,
  isFirstTimeSetup: true,
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
      // Initialize Auth
      .addCase(initializeMasterAuth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initializeMasterAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUser = action.payload.currentUser;
        state.isFirstTimeSetup = action.payload.isFirstTimeSetup;
        state.initialized = true;
      })
      .addCase(initializeMasterAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.currentUser = null;
        state.isFirstTimeSetup = true;
        state.initialized = true;
      })
      
      // Signup
      .addCase(signupMasterAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signupMasterAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUser = {
          id: action.payload.user.id,
          email: action.payload.user.email,
          full_name: action.payload.user.full_name,
          phone: action.payload.user.phone,
          role: action.payload.user.role,
          loginTime: new Date().toISOString()
        };
        state.isFirstTimeSetup = false;
      })
      .addCase(signupMasterAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.currentUser = null;
      })
      
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

export const signupMasterAdmin = createAsyncThunk(
  'masterAuth/signup',
  async ({ full_name, email, phone, password }, { rejectWithValue }) => {
    try {
      const userData = {
        full_name,
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        password,
        master_password: "MASTER_ADMIN_SETUP_2024"
      };
      
      const user = await authApi.createMasterAdmin(userData);
      
      // After successful creation, login to get token
      await authApi.login(email, password);
      
      return { user };
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Signup failed. Please try again.'));
    }
  }
);

export const loginMasterAdmin = createAsyncThunk(
  'masterAuth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      // Login to get access token
      await authApi.login(email, password);
      
      // Get current user info
      const user = await adminApi.getMe();
      
      return { user };
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Invalid email or password'));
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