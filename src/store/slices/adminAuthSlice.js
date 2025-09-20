import { createSlice } from '@reduxjs/toolkit';
import CryptoJS from 'crypto-js';

// Constants
const ENCRYPTION_KEY = 'admin-renty-2025-secret-key';
const ADMIN_STORAGE_KEY = 'admin_users';
const CURRENT_ADMIN_KEY = 'current_admin_user';

// Utility functions
const encrypt = (text) => {
  try {
    return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
  } catch (error) {
    console.error('Encryption error:', error);
    return null;
  }
};

const decrypt = (encryptedText) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};

const hashPassword = (password) => {
  return CryptoJS.SHA256(password + ENCRYPTION_KEY).toString();
};

// Get stored admins from localStorage
const getStoredAdmins = () => {
  try {
    // First try the encrypted storage
    const encryptedAdmins = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (encryptedAdmins) {
      const decryptedAdmins = decrypt(encryptedAdmins);
      if (decryptedAdmins) {
        return JSON.parse(decryptedAdmins);
      }
    }
    
    // Fallback: check for old 'adminAccounts' format
    const oldAdminAccounts = localStorage.getItem('adminAccounts');
    if (oldAdminAccounts) {
      const admins = JSON.parse(oldAdminAccounts);
      // Migrate old format to new format and save encrypted
      if (admins.length > 0) {
        const migratedAdmins = admins.map(admin => ({
          id: admin.id || Date.now().toString(),
          username: admin.name,
          name: admin.name,
          account: admin.email,
          email: admin.email,
          password: hashPassword(admin.password),
          mobileNumber: admin.mobile,
          mobile: admin.mobile,
          createdAt: admin.createdAt || new Date().toISOString(),
          role: admin.role || 'admin',
          isActive: true
        }));
        
        // Save in new encrypted format
        const encryptedAdmins = encrypt(JSON.stringify(migratedAdmins));
        if (encryptedAdmins) {
          localStorage.setItem(ADMIN_STORAGE_KEY, encryptedAdmins);
        }
        localStorage.removeItem('adminAccounts');
        
        return migratedAdmins;
      }
    }
    
    // Return empty array - no mock data, use API only
    return [];
  } catch (error) {
    console.error('Error getting stored admins:', error);
    return [];
  }
};

// Save admins to localStorage
const saveAdmins = (admins) => {
  try {
    const encryptedAdmins = encrypt(JSON.stringify(admins));
    if (encryptedAdmins) {
      localStorage.setItem(ADMIN_STORAGE_KEY, encryptedAdmins);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error saving admins:', error);
    return false;
  }
};

// Get current admin session from localStorage
const getCurrentAdminSession = () => {
  try {
    const encryptedSession = localStorage.getItem(CURRENT_ADMIN_KEY);
    if (encryptedSession) {
      const decryptedSession = decrypt(encryptedSession);
      if (decryptedSession) {
        const adminSession = JSON.parse(decryptedSession);
        
        // Check if session is still valid (24 hours)
        const loginTime = new Date(adminSession.loginTime);
        const now = new Date();
        const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
        
        if (hoursDiff < 24) {
          return adminSession;
        } else {
          // Session expired, clear it
          localStorage.removeItem(CURRENT_ADMIN_KEY);
        }
      }
    }
    return null;
  } catch (error) {
    console.error('Error loading admin session:', error);
    localStorage.removeItem(CURRENT_ADMIN_KEY);
    return null;
  }
};

// Initial state
const initialState = {
  currentAdmin: getCurrentAdminSession(),
  isLoading: false,
  error: null,
  admins: getStoredAdmins()
};

// Admin auth slice
const adminAuthSlice = createSlice({
  name: 'adminAuth',
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
    setCurrentAdmin: (state, action) => {
      state.currentAdmin = action.payload;
      if (action.payload) {
        const encryptedSession = encrypt(JSON.stringify(action.payload));
        if (encryptedSession) {
          localStorage.setItem(CURRENT_ADMIN_KEY, encryptedSession);
        }
      } else {
        localStorage.removeItem(CURRENT_ADMIN_KEY);
      }
    },
    loginSuccess: (state, action) => {
      const { admin } = action.payload;
      const adminSession = {
        id: admin.id,
        username: admin.username || admin.name,
        account: admin.account || admin.email,
        email: admin.email,
        mobileNumber: admin.mobileNumber || admin.mobile,
        role: admin.role,
        loginTime: new Date().toISOString()
      };
      
      state.currentAdmin = adminSession;
      state.isLoading = false;
      state.error = null;
      
      const encryptedSession = encrypt(JSON.stringify(adminSession));
      if (encryptedSession) {
        localStorage.setItem(CURRENT_ADMIN_KEY, encryptedSession);
      }
    },
    loginFailure: (state, action) => {
      state.currentAdmin = null;
      state.isLoading = false;
      state.error = action.payload;
      localStorage.removeItem(CURRENT_ADMIN_KEY);
    },
    logout: (state) => {
      state.currentAdmin = null;
      state.error = null;
      localStorage.removeItem(CURRENT_ADMIN_KEY);
    },
    setAdmins: (state, action) => {
      state.admins = action.payload;
      saveAdmins(action.payload);
    },
    addAdmin: (state, action) => {
      const newAdmin = {
        ...action.payload,
        id: Date.now().toString(),
        password: hashPassword(action.payload.password),
        createdAt: new Date().toISOString(),
        isActive: true
      };
      state.admins.push(newAdmin);
      saveAdmins(state.admins);
    },
    updateAdminStatus: (state, action) => {
      const { adminId, isActive } = action.payload;
      const adminIndex = state.admins.findIndex(admin => admin.id === adminId);
      if (adminIndex !== -1) {
        state.admins[adminIndex].isActive = isActive;
        state.admins[adminIndex].updatedAt = new Date().toISOString();
        saveAdmins(state.admins);
      }
    },
    deleteAdmin: (state, action) => {
      state.admins = state.admins.filter(admin => admin.id !== action.payload);
      saveAdmins(state.admins);
    },
    updateAdminPassword: (state, action) => {
      const { adminId, newPassword } = action.payload;
      const adminIndex = state.admins.findIndex(admin => admin.id === adminId);
      if (adminIndex !== -1) {
        state.admins[adminIndex].password = hashPassword(newPassword);
        state.admins[adminIndex].updatedAt = new Date().toISOString();
        saveAdmins(state.admins);
      }
    }
  }
});

// Export actions
export const {
  setLoading,
  setError,
  clearError,
  setCurrentAdmin,
  loginSuccess,
  loginFailure,
  logout,
  setAdmins,
  addAdmin,
  updateAdminStatus,
  deleteAdmin,
  updateAdminPassword
} = adminAuthSlice.actions;

// Async thunks
export const loginAdmin = (accountOrMobileOrEmail, password) => async (dispatch, getState) => {
  try {
    dispatch(setLoading(true));
    const { adminAuth } = getState();
    
    // Try to find admin with matching credentials (hashed password)
    let admin = adminAuth.admins.find(admin => 
      (admin.account === accountOrMobileOrEmail || 
       admin.mobileNumber === accountOrMobileOrEmail ||
       admin.email === accountOrMobileOrEmail ||
       admin.mobile === accountOrMobileOrEmail) && 
      admin.password === hashPassword(password) &&
      (admin.isActive !== false)
    );

    // If not found with hashed password, try with plain text (for migration)
    if (!admin) {
      admin = adminAuth.admins.find(admin => 
        (admin.account === accountOrMobileOrEmail || 
         admin.mobileNumber === accountOrMobileOrEmail ||
         admin.email === accountOrMobileOrEmail ||
         admin.mobile === accountOrMobileOrEmail) && 
        admin.password === password &&
        (admin.isActive !== false)
      );
      
      // If found with plain text, update to hashed password
      if (admin) {
        dispatch(updateAdminPassword({ adminId: admin.id, newPassword: password }));
      }
    }

    if (admin) {
      dispatch(loginSuccess({ admin }));
      return { success: true };
    }
    
    dispatch(loginFailure('Invalid credentials or account is inactive'));
    return { success: false, message: 'Invalid credentials or account is inactive' };
  } catch (error) {
    console.error('Admin login error:', error);
    dispatch(loginFailure('Login failed. Please try again.'));
    return { success: false, message: 'Login failed. Please try again.' };
  }
};

export const createAdminAccount = (adminData) => async (dispatch, getState) => {
  try {
    const { adminAuth } = getState();
    const { username, account, password, mobileNumber, name, email, mobile, role } = adminData;
    
    // Support both formats
    const adminName = username || name;
    const adminAccount = account || email;
    const adminMobile = mobileNumber || mobile;
    const adminRole = role || 'studio_rental';
    
    // Check if account, email, or mobile number already exists
    const existingAdmin = adminAuth.admins.find(admin => 
      admin.account === adminAccount || 
      admin.email === adminAccount ||
      admin.mobileNumber === adminMobile ||
      admin.mobile === adminMobile ||
      admin.username === adminName ||
      admin.name === adminName
    );
    
    if (existingAdmin) {
      return { 
        success: false, 
        message: 'Account, username, email, or mobile number already exists' 
      };
    }

    const newAdminData = {
      username: adminName?.trim(),
      name: adminName?.trim(),
      account: adminAccount?.trim(),
      email: adminAccount?.trim(),
      password: password,
      mobileNumber: adminMobile?.trim(),
      mobile: adminMobile?.trim(),
      role: adminRole
    };

    dispatch(addAdmin(newAdminData));
    
    return { 
      success: true, 
      message: 'Admin account created successfully',
      admin: {
        id: newAdminData.id,
        username: newAdminData.username,
        name: newAdminData.name,
        account: newAdminData.account,
        email: newAdminData.email,
        mobileNumber: newAdminData.mobileNumber,
        mobile: newAdminData.mobile,
        createdAt: newAdminData.createdAt,
        role: newAdminData.role,
        isActive: newAdminData.isActive
      }
    };
  } catch (error) {
    console.error('Create admin account error:', error);
    return { success: false, message: 'Failed to create admin account' };
  }
};

// Selectors
export const selectAdminAuth = (state) => state.adminAuth;
export const selectCurrentAdmin = (state) => state.adminAuth.currentAdmin;
export const selectAdminLoading = (state) => state.adminAuth.isLoading;
export const selectAdminError = (state) => state.adminAuth.error;
export const selectAllAdmins = (state) => state.adminAuth.admins;
export const selectIsAdminAuthenticated = (state) => !!state.adminAuth.currentAdmin;

export const selectAllAdminAccounts = (state) => 
  state.adminAuth.admins.map(admin => ({
    id: admin.id,
    username: admin.username,
    account: admin.account,
    mobileNumber: admin.mobileNumber,
    createdAt: admin.createdAt,
    role: admin.role,
    isActive: admin.isActive
  }));

export default adminAuthSlice.reducer;