var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import React, { useState, useCallback, useEffect, createContext, useContext, useRef, useMemo } from "react";
import { renderToString } from "react-dom/server";
import { Link, useNavigate, useParams, useSearchParams, Navigate, useLocation, BrowserRouter, Routes, Route, StaticRouter } from "react-router-dom";
import { useDispatch, useSelector, Provider } from "react-redux";
import { createSlice, createSelector, createAsyncThunk, configureStore } from "@reduxjs/toolkit";
import CryptoJS from "crypto-js";
import { QueryClient, QueryClientProvider, HydrationBoundary } from "@tanstack/react-query";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook, faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { faMapMarkerAlt, faCamera, faBed, faShower, faRuler, faMap, faHome, faKey, faCouch, faClipboardList, faCheck, faTrash, faMoneyBillWave, faLockOpen, faLock, faEdit, faUsers, faBell, faSignOutAlt, faEnvelope, faEye, faEyeSlash, faBuilding, faInfoCircle, faCheckCircle, faExclamationTriangle, faTimesCircle, faStar, faChartBar, faDollarSign } from "@fortawesome/free-solid-svg-icons";
const localStorageMiddleware = (store2) => (next) => (action) => {
  const result = next(action);
  store2.getState();
  const propertyActions = [
    "property/addApartment",
    "property/updateApartment",
    "property/deleteApartment",
    "property/addStudio",
    "property/updateStudio",
    "property/deleteStudio",
    "property/toggleStudioAvailability",
    "property/addSaleApartment",
    "property/updateSaleApartment",
    "property/deleteSaleApartment",
    "property/setApartments",
    "property/setSaleApartments",
    "property/clearAllData"
  ];
  if (propertyActions.includes(action.type)) ;
  return result;
};
const generateId = (prefix = "id") => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
const initialState$3 = {
  apartments: [],
  saleApartments: [],
  loading: false,
  error: null
};
const propertySlice = createSlice({
  name: "property",
  initialState: initialState$3,
  reducers: {
    // Loading state
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    // Apartments
    setApartments: (state, action) => {
      state.apartments = action.payload;
    },
    addApartment: (state, action) => {
      const newApartment = {
        ...action.payload,
        id: action.payload.id || generateId("apt"),
        studios: action.payload.studios || [],
        totalStudios: action.payload.totalStudios || 0
      };
      state.apartments.push(newApartment);
    },
    updateApartment: (state, action) => {
      const index = state.apartments.findIndex((apt) => apt.id === action.payload.id);
      if (index !== -1) {
        state.apartments[index] = action.payload;
      }
    },
    deleteApartment: (state, action) => {
      state.apartments = state.apartments.filter((apt) => apt.id !== action.payload);
    },
    // Studios
    addStudio: (state, action) => {
      const { apartmentId, studio } = action.payload;
      const apartmentIndex = state.apartments.findIndex((apt) => apt.id === apartmentId);
      if (apartmentIndex !== -1) {
        const newStudio = {
          ...studio,
          id: studio.id || generateId("studio"),
          apartmentId
        };
        state.apartments[apartmentIndex].studios.push(newStudio);
        state.apartments[apartmentIndex].totalStudios = state.apartments[apartmentIndex].studios.length;
      }
    },
    updateStudio: (state, action) => {
      const { apartmentId, studio } = action.payload;
      const apartmentIndex = state.apartments.findIndex((apt) => apt.id === apartmentId);
      if (apartmentIndex !== -1) {
        const studioIndex = state.apartments[apartmentIndex].studios.findIndex((s) => s.id === studio.id);
        if (studioIndex !== -1) {
          state.apartments[apartmentIndex].studios[studioIndex] = studio;
        }
      }
    },
    deleteStudio: (state, action) => {
      const { apartmentId, studioId } = action.payload;
      const apartmentIndex = state.apartments.findIndex((apt) => apt.id === apartmentId);
      if (apartmentIndex !== -1) {
        state.apartments[apartmentIndex].studios = state.apartments[apartmentIndex].studios.filter(
          (studio) => studio.id !== studioId
        );
        state.apartments[apartmentIndex].totalStudios = state.apartments[apartmentIndex].studios.length;
      }
    },
    toggleStudioAvailability: (state, action) => {
      const { apartmentId, studioId } = action.payload;
      const apartmentIndex = state.apartments.findIndex((apt) => apt.id === apartmentId);
      if (apartmentIndex !== -1) {
        const studioIndex = state.apartments[apartmentIndex].studios.findIndex((s) => s.id === studioId);
        if (studioIndex !== -1) {
          state.apartments[apartmentIndex].studios[studioIndex].isAvailable = !state.apartments[apartmentIndex].studios[studioIndex].isAvailable;
        }
      }
    },
    // Sale Apartments
    setSaleApartments: (state, action) => {
      state.saleApartments = action.payload;
    },
    addSaleApartment: (state, action) => {
      const newSaleApartment = {
        ...action.payload,
        id: action.payload.id || generateId("sale_apt"),
        type: "sale",
        listedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      state.saleApartments.push(newSaleApartment);
    },
    updateSaleApartment: (state, action) => {
      const index = state.saleApartments.findIndex((apt) => apt.id === action.payload.id);
      if (index !== -1) {
        state.saleApartments[index] = action.payload;
      }
    },
    deleteSaleApartment: (state, action) => {
      state.saleApartments = state.saleApartments.filter((apt) => apt.id !== action.payload);
    },
    // Clear all data
    clearAllData: (state) => {
      state.apartments = [];
      state.saleApartments = [];
      state.error = null;
    }
  }
});
const {
  setLoading: setLoading$2,
  setError: setError$2,
  clearError: clearError$2,
  setApartments,
  addApartment,
  updateApartment,
  deleteApartment,
  addStudio,
  updateStudio,
  deleteStudio,
  toggleStudioAvailability,
  setSaleApartments,
  addSaleApartment,
  updateSaleApartment,
  deleteSaleApartment,
  clearAllData
} = propertySlice.actions;
const selectProperty = (state) => state.property;
const selectApartments = (state) => state.property.apartments;
const selectSaleApartments = (state) => state.property.saleApartments;
const selectPropertyLoading = (state) => state.property.loading;
const selectPropertyError = (state) => state.property.error;
const propertyReducer = propertySlice.reducer;
const ENCRYPTION_KEY = "admin-renty-2025-secret-key";
const ADMIN_STORAGE_KEY = "admin_users";
const CURRENT_ADMIN_KEY = "current_admin_user";
const isBrowser$1 = typeof window !== "undefined";
const storageGet = (key) => {
  if (!isBrowser$1) return null;
  return localStorage.getItem(key);
};
const storageSet = (key, value) => {
  if (!isBrowser$1) return;
  localStorage.setItem(key, value);
};
const storageRemove = (key) => {
  if (!isBrowser$1) return;
  localStorage.removeItem(key);
};
const encrypt = (text) => {
  try {
    return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
  } catch (error) {
    return null;
  }
};
const decrypt = (encryptedText) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    return null;
  }
};
const hashPassword = (password) => {
  return CryptoJS.SHA256(password + ENCRYPTION_KEY).toString();
};
const getStoredAdmins = () => {
  if (!isBrowser$1) return [];
  try {
    const encryptedAdmins = storageGet(ADMIN_STORAGE_KEY);
    if (encryptedAdmins) {
      const decryptedAdmins = decrypt(encryptedAdmins);
      if (decryptedAdmins) {
        return JSON.parse(decryptedAdmins);
      }
    }
    const oldAdminAccounts = storageGet("adminAccounts");
    if (oldAdminAccounts) {
      const admins = JSON.parse(oldAdminAccounts);
      if (admins.length > 0) {
        const migratedAdmins = admins.map((admin) => ({
          id: admin.id || Date.now().toString(),
          username: admin.name,
          name: admin.name,
          account: admin.email,
          email: admin.email,
          password: hashPassword(admin.password),
          mobileNumber: admin.mobile,
          mobile: admin.mobile,
          createdAt: admin.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
          role: admin.role || "admin",
          isActive: true
        }));
        const encryptedAdmins2 = encrypt(JSON.stringify(migratedAdmins));
        if (encryptedAdmins2) {
          storageSet(ADMIN_STORAGE_KEY, encryptedAdmins2);
        }
        storageRemove("adminAccounts");
        return migratedAdmins;
      }
    }
    return [];
  } catch (error) {
    return [];
  }
};
const saveAdmins = (admins) => {
  if (!isBrowser$1) return false;
  try {
    const encryptedAdmins = encrypt(JSON.stringify(admins));
    if (encryptedAdmins) {
      storageSet(ADMIN_STORAGE_KEY, encryptedAdmins);
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
};
const getCurrentAdminSession = () => {
  if (!isBrowser$1) return null;
  try {
    const encryptedSession = storageGet(CURRENT_ADMIN_KEY);
    if (encryptedSession) {
      const decryptedSession = decrypt(encryptedSession);
      if (decryptedSession) {
        const adminSession = JSON.parse(decryptedSession);
        const loginTime = new Date(adminSession.loginTime);
        const now = /* @__PURE__ */ new Date();
        const hoursDiff = (now - loginTime) / (1e3 * 60 * 60);
        if (hoursDiff < 24) {
          return adminSession;
        } else {
          storageRemove(CURRENT_ADMIN_KEY);
        }
      }
    }
    return null;
  } catch (error) {
    storageRemove(CURRENT_ADMIN_KEY);
    return null;
  }
};
const initialState$2 = {
  currentAdmin: getCurrentAdminSession(),
  isLoading: false,
  error: null,
  admins: getStoredAdmins()
};
const adminAuthSlice = createSlice({
  name: "adminAuth",
  initialState: initialState$2,
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
          storageSet(CURRENT_ADMIN_KEY, encryptedSession);
        }
      } else {
        storageRemove(CURRENT_ADMIN_KEY);
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
        loginTime: (/* @__PURE__ */ new Date()).toISOString()
      };
      state.currentAdmin = adminSession;
      state.isLoading = false;
      state.error = null;
      const encryptedSession = encrypt(JSON.stringify(adminSession));
      if (encryptedSession) {
        storageSet(CURRENT_ADMIN_KEY, encryptedSession);
      }
    },
    loginFailure: (state, action) => {
      state.currentAdmin = null;
      state.isLoading = false;
      state.error = action.payload;
      storageRemove(CURRENT_ADMIN_KEY);
    },
    logout: (state) => {
      state.currentAdmin = null;
      state.error = null;
      storageRemove(CURRENT_ADMIN_KEY);
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
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        isActive: true
      };
      state.admins.push(newAdmin);
      saveAdmins(state.admins);
    },
    updateAdminStatus: (state, action) => {
      const { adminId, isActive } = action.payload;
      const adminIndex = state.admins.findIndex((admin) => admin.id === adminId);
      if (adminIndex !== -1) {
        state.admins[adminIndex].isActive = isActive;
        state.admins[adminIndex].updatedAt = (/* @__PURE__ */ new Date()).toISOString();
        saveAdmins(state.admins);
      }
    },
    deleteAdmin: (state, action) => {
      state.admins = state.admins.filter((admin) => admin.id !== action.payload);
      saveAdmins(state.admins);
    },
    updateAdminPassword: (state, action) => {
      const { adminId, newPassword } = action.payload;
      const adminIndex = state.admins.findIndex((admin) => admin.id === adminId);
      if (adminIndex !== -1) {
        state.admins[adminIndex].password = hashPassword(newPassword);
        state.admins[adminIndex].updatedAt = (/* @__PURE__ */ new Date()).toISOString();
        saveAdmins(state.admins);
      }
    }
  }
});
const {
  setLoading: setLoading$1,
  setError: setError$1,
  clearError: clearError$1,
  setCurrentAdmin,
  loginSuccess,
  loginFailure,
  logout: logout$1,
  setAdmins,
  addAdmin,
  updateAdminStatus,
  deleteAdmin,
  updateAdminPassword
} = adminAuthSlice.actions;
const loginAdmin = (accountOrMobileOrEmail, password) => async (dispatch, getState) => {
  try {
    dispatch(setLoading$1(true));
    const { adminAuth } = getState();
    let admin = adminAuth.admins.find(
      (admin2) => (admin2.account === accountOrMobileOrEmail || admin2.mobileNumber === accountOrMobileOrEmail || admin2.email === accountOrMobileOrEmail || admin2.mobile === accountOrMobileOrEmail) && admin2.password === hashPassword(password) && admin2.isActive !== false
    );
    if (!admin) {
      admin = adminAuth.admins.find(
        (admin2) => (admin2.account === accountOrMobileOrEmail || admin2.mobileNumber === accountOrMobileOrEmail || admin2.email === accountOrMobileOrEmail || admin2.mobile === accountOrMobileOrEmail) && admin2.password === password && admin2.isActive !== false
      );
      if (admin) {
        dispatch(updateAdminPassword({ adminId: admin.id, newPassword: password }));
      }
    }
    if (admin) {
      dispatch(loginSuccess({ admin }));
      return { success: true };
    }
    dispatch(loginFailure("Invalid credentials or account is inactive"));
    return { success: false, message: "Invalid credentials or account is inactive" };
  } catch (error) {
    dispatch(loginFailure("Login failed. Please try again."));
    return { success: false, message: "Login failed. Please try again." };
  }
};
const createAdminAccount = (adminData) => async (dispatch, getState) => {
  var _a;
  try {
    const { adminApi: adminApi2 } = await Promise.resolve().then(() => api);
    const apiData = {
      full_name: adminData.full_name || adminData.name || adminData.username,
      email: adminData.email || adminData.account,
      phone: adminData.phone || adminData.mobile || adminData.mobileNumber,
      role: adminData.role || "studio_rental",
      password: adminData.password
    };
    const response = await adminApi2.create(apiData);
    const transformedAdmin = {
      id: response.id,
      username: response.full_name,
      name: response.full_name,
      full_name: response.full_name,
      account: response.email,
      email: response.email,
      mobileNumber: response.phone,
      mobile: response.phone,
      phone: response.phone,
      role: response.role,
      createdAt: response.created_at || (/* @__PURE__ */ new Date()).toISOString(),
      isActive: response.is_active !== false
    };
    dispatch(addAdmin(transformedAdmin));
    return {
      success: true,
      message: "Admin account created successfully",
      admin: transformedAdmin
    };
  } catch (error) {
    let errorMessage = "Failed to create admin account";
    if ((_a = error.data) == null ? void 0 : _a.detail) {
      errorMessage = error.data.detail;
    } else if (error.message) {
      errorMessage = error.message;
    }
    return { success: false, error: errorMessage, message: errorMessage };
  }
};
const deleteAdminAccount = (adminId) => async (dispatch) => {
  var _a;
  try {
    const { adminApi: adminApi2 } = await Promise.resolve().then(() => api);
    const response = await adminApi2.delete(adminId);
    dispatch(deleteAdmin(adminId));
    return { success: true, message: "Admin deleted successfully", data: response };
  } catch (error) {
    const errorMessage = ((_a = error.data) == null ? void 0 : _a.detail) || error.message || "Failed to delete admin";
    return { success: false, error: errorMessage, message: errorMessage };
  }
};
const selectAdminAuth = (state) => state.adminAuth;
const selectCurrentAdmin = (state) => state.adminAuth.currentAdmin;
const selectAdminLoading = (state) => state.adminAuth.isLoading;
const selectAdminError = (state) => state.adminAuth.error;
const selectAllAdmins = (state) => state.adminAuth.admins;
const selectIsAdminAuthenticated = (state) => !!state.adminAuth.currentAdmin;
const selectAllAdminAccounts = createSelector(
  [selectAllAdmins],
  (admins) => admins.map((admin) => ({
    id: admin.id,
    username: admin.username,
    account: admin.account,
    mobileNumber: admin.mobileNumber,
    createdAt: admin.createdAt,
    role: admin.role,
    isActive: admin.isActive
  }))
);
const adminAuthReducer = adminAuthSlice.reducer;
const ADMIN_ROLES = {
  SUPER_ADMIN: "super_admin",
  STUDIO_RENTAL: "studio_rental",
  APARTMENT_SALE: "apartment_sale"
};
const LOCATIONS = {
  MAADI: "maadi",
  MOKKATTAM: "mokkattam"
};
const BATHROOM_TYPES = {
  PRIVATE: "private",
  SHARED: "shared"
};
const PART_STATUS = {
  AVAILABLE: "available",
  RENTED: "rented",
  UPCOMING_END: "upcoming_end"
};
const FURNISHED_STATUS = {
  YES: "yes",
  NO: "no"
};
const BALCONY_TYPES = {
  YES: "yes",
  SHARED: "shared",
  NO: "no"
};
const CUSTOMER_SOURCES = {
  FACEBOOK: "facebook",
  INSTAGRAM: "instagram",
  GOOGLE: "google",
  REFERRAL: "referral",
  WALK_IN: "walk_in",
  OTHER: "other"
};
const validateEnum = (value, enumObject, fieldName = "field") => {
  const validValues = Object.values(enumObject);
  if (!validValues.includes(value)) {
    throw new Error(`Invalid ${fieldName}: "${value}". Valid values are: ${validValues.join(", ")}`);
  }
  return true;
};
const convertToApiEnum = {
  location: (displayValue) => {
    const normalizedValue = displayValue == null ? void 0 : displayValue.toLowerCase();
    switch (normalizedValue) {
      case "maadi":
        return LOCATIONS.MAADI;
      case "mokkattam":
      case "mokattam":
        return LOCATIONS.MOKKATTAM;
      default:
        return normalizedValue;
    }
  },
  bathrooms: (displayValue) => {
    const normalizedValue = displayValue == null ? void 0 : displayValue.toLowerCase();
    switch (normalizedValue) {
      case "private":
      case "own":
      case "personal":
        return BATHROOM_TYPES.PRIVATE;
      case "shared":
      case "common":
        return BATHROOM_TYPES.SHARED;
      default:
        return normalizedValue;
    }
  },
  furnished: (displayValue) => {
    if (typeof displayValue === "boolean") {
      return displayValue ? FURNISHED_STATUS.YES : FURNISHED_STATUS.NO;
    }
    const normalizedValue = displayValue == null ? void 0 : displayValue.toLowerCase();
    switch (normalizedValue) {
      case "yes":
      case "true":
      case "furnished":
        return FURNISHED_STATUS.YES;
      case "no":
      case "false":
      case "unfurnished":
        return FURNISHED_STATUS.NO;
      default:
        return normalizedValue;
    }
  },
  balcony: (displayValue) => {
    const normalizedValue = displayValue == null ? void 0 : displayValue.toLowerCase();
    switch (normalizedValue) {
      case "yes":
      case "private":
      case "own":
        return BALCONY_TYPES.YES;
      case "shared":
      case "common":
        return BALCONY_TYPES.SHARED;
      case "no":
      case "none":
        return BALCONY_TYPES.NO;
      default:
        return normalizedValue;
    }
  },
  customerSource: (displayValue) => {
    const normalizedValue = displayValue == null ? void 0 : displayValue.toLowerCase();
    switch (normalizedValue) {
      case "facebook":
      case "fb":
        return CUSTOMER_SOURCES.FACEBOOK;
      case "instagram":
      case "ig":
      case "insta":
        return CUSTOMER_SOURCES.INSTAGRAM;
      case "google":
      case "search":
        return CUSTOMER_SOURCES.GOOGLE;
      case "referral":
      case "friend":
      case "recommendation":
        return CUSTOMER_SOURCES.REFERRAL;
      case "walk_in":
      case "walk-in":
      case "walkin":
      case "direct":
        return CUSTOMER_SOURCES.WALK_IN;
      case "other":
      default:
        return CUSTOMER_SOURCES.OTHER;
    }
  },
  adminRole: (displayValue) => {
    const normalizedValue = displayValue == null ? void 0 : displayValue.toLowerCase().replace(/\s+/g, "_");
    switch (normalizedValue) {
      case "super_admin":
      case "master_admin":
      case "admin":
        return ADMIN_ROLES.SUPER_ADMIN;
      case "studio_rental":
      case "rental":
        return ADMIN_ROLES.STUDIO_RENTAL;
      case "apartment_sale":
      case "sale":
        return ADMIN_ROLES.APARTMENT_SALE;
      default:
        return normalizedValue;
    }
  },
  status: (displayValue) => {
    const normalizedValue = displayValue == null ? void 0 : displayValue.toLowerCase();
    switch (normalizedValue) {
      case "available":
      case "vacant":
      case "free":
        return PART_STATUS.AVAILABLE;
      case "rented":
      case "occupied":
      case "taken":
        return PART_STATUS.RENTED;
      case "upcoming_end":
      case "upcoming-end":
      case "ending_soon":
        return PART_STATUS.UPCOMING_END;
      default:
        return normalizedValue;
    }
  }
};
const convertFromApiEnum = {
  location: (apiValue) => {
    switch (apiValue) {
      case LOCATIONS.MAADI:
        return "Maadi";
      case LOCATIONS.MOKKATTAM:
        return "Mokkattam";
      default:
        return (apiValue == null ? void 0 : apiValue.charAt(0).toUpperCase()) + (apiValue == null ? void 0 : apiValue.slice(1)) || "Unknown";
    }
  },
  bathrooms: (apiValue) => {
    switch (apiValue) {
      case BATHROOM_TYPES.PRIVATE:
        return "Private";
      case BATHROOM_TYPES.SHARED:
        return "Shared";
      default:
        return (apiValue == null ? void 0 : apiValue.charAt(0).toUpperCase()) + (apiValue == null ? void 0 : apiValue.slice(1)) || "Unknown";
    }
  },
  furnished: (apiValue) => {
    switch (apiValue) {
      case FURNISHED_STATUS.YES:
        return "Furnished";
      case FURNISHED_STATUS.NO:
        return "Unfurnished";
      default:
        return apiValue === true ? "Furnished" : "Unfurnished";
    }
  },
  balcony: (apiValue) => {
    switch (apiValue) {
      case BALCONY_TYPES.YES:
        return "Private Balcony";
      case BALCONY_TYPES.SHARED:
        return "Shared Balcony";
      case BALCONY_TYPES.NO:
        return "No Balcony";
      default:
        return "Unknown";
    }
  },
  customerSource: (apiValue) => {
    switch (apiValue) {
      case CUSTOMER_SOURCES.FACEBOOK:
        return "Facebook";
      case CUSTOMER_SOURCES.INSTAGRAM:
        return "Instagram";
      case CUSTOMER_SOURCES.GOOGLE:
        return "Google";
      case CUSTOMER_SOURCES.REFERRAL:
        return "Referral";
      case CUSTOMER_SOURCES.WALK_IN:
        return "Walk-in";
      case CUSTOMER_SOURCES.OTHER:
        return "Other";
      default:
        return (apiValue == null ? void 0 : apiValue.charAt(0).toUpperCase()) + (apiValue == null ? void 0 : apiValue.slice(1)) || "Unknown";
    }
  },
  adminRole: (apiValue) => {
    switch (apiValue) {
      case ADMIN_ROLES.SUPER_ADMIN:
        return "Super Admin";
      case ADMIN_ROLES.STUDIO_RENTAL:
        return "Studio Rental";
      case ADMIN_ROLES.APARTMENT_SALE:
        return "Apartment Sale";
      default:
        return (apiValue == null ? void 0 : apiValue.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())) || "Unknown";
    }
  },
  status: (apiValue) => {
    switch (apiValue) {
      case PART_STATUS.AVAILABLE:
        return "Available";
      case PART_STATUS.RENTED:
        return "Rented";
      case PART_STATUS.UPCOMING_END:
        return "Ending Soon";
      default:
        return (apiValue == null ? void 0 : apiValue.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())) || "Unknown";
    }
  }
};
const getValidOptions = {
  locations: () => Object.values(LOCATIONS).map((value) => ({
    value,
    label: convertFromApiEnum.location(value)
  })),
  bathroomTypes: () => Object.values(BATHROOM_TYPES).map((value) => ({
    value,
    label: convertFromApiEnum.bathrooms(value)
  })),
  furnishedStatus: () => Object.values(FURNISHED_STATUS).map((value) => ({
    value,
    label: convertFromApiEnum.furnished(value)
  })),
  balconyTypes: () => Object.values(BALCONY_TYPES).map((value) => ({
    value,
    label: convertFromApiEnum.balcony(value)
  })),
  customerSources: () => Object.values(CUSTOMER_SOURCES).map((value) => ({
    value,
    label: convertFromApiEnum.customerSource(value)
  })),
  adminRoles: () => Object.values(ADMIN_ROLES).map((value) => ({
    value,
    label: convertFromApiEnum.adminRole(value)
  })),
  partStatuses: () => Object.values(PART_STATUS).map((value) => ({
    value,
    label: convertFromApiEnum.status(value)
  }))
};
var define_process_env_default$3 = { REACT_APP_API_BASE_URL: "http://localhost:8000/api/v1", REACT_APP_API_TIMEOUT: "30000", REACT_APP_TOKEN_STORAGE_KEY: "api_access_token", REACT_APP_ENVIRONMENT: "development", REACT_APP_ENABLE_API_LOGGING: "true", REACT_APP_ENABLE_RETRY_LOGIC: "true", REACT_APP_MAX_RETRY_ATTEMPTS: "3" };
const resolveApiBaseUrl = () => {
  const configuredBaseUrl = define_process_env_default$3.REACT_APP_API_BASE_URL.trim();
  if (!configuredBaseUrl) {
    return "/api/v1";
  }
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    if (configuredBaseUrl.startsWith("http://localhost:8000") || configuredBaseUrl.startsWith("http://127.0.0.1:8000")) {
      return "http://127.0.0.1:8000/api/v1";
    }
  }
  return configuredBaseUrl.replace(/\/$/, "");
};
const API_CONFIG = {
  BASE_URL: resolveApiBaseUrl(),
  TIMEOUT: parseInt(define_process_env_default$3.REACT_APP_API_TIMEOUT) || 1e4,
  HEADERS: {
    "Content-Type": "application/json"
  },
  ENVIRONMENT: define_process_env_default$3.REACT_APP_ENVIRONMENT,
  ENABLE_LOGGING: define_process_env_default$3.REACT_APP_ENABLE_API_LOGGING === "true",
  ENABLE_RETRY: define_process_env_default$3.REACT_APP_ENABLE_RETRY_LOGIC !== "false",
  MAX_RETRIES: parseInt(define_process_env_default$3.REACT_APP_MAX_RETRY_ATTEMPTS) || 3
};
class TokenManager {
  static isBrowser() {
    return typeof window !== "undefined";
  }
  static getToken() {
    if (!this.isBrowser()) {
      return null;
    }
    if (!this.TOKEN_KEY) {
      this.TOKEN_KEY = "api_access_token";
    }
    return localStorage.getItem(this.TOKEN_KEY);
  }
  static setToken(token) {
    if (!this.isBrowser()) {
      return;
    }
    if (!this.TOKEN_KEY) {
      this.TOKEN_KEY = "api_access_token";
    }
    localStorage.setItem(this.TOKEN_KEY, token);
  }
  static removeToken() {
    if (!this.isBrowser()) {
      return;
    }
    if (!this.TOKEN_KEY) {
      this.TOKEN_KEY = "api_access_token";
    }
    localStorage.removeItem(this.TOKEN_KEY);
  }
  static isAuthenticated() {
    return !!this.getToken();
  }
}
__publicField(TokenManager, "TOKEN_KEY", define_process_env_default$3.REACT_APP_TOKEN_STORAGE_KEY);
const validateConfig = () => {
  if (isNaN(API_CONFIG.TIMEOUT) || API_CONFIG.TIMEOUT < 1e3) {
    API_CONFIG.TIMEOUT = 1e4;
  }
  if (isNaN(API_CONFIG.MAX_RETRIES) || API_CONFIG.MAX_RETRIES < 0) {
    API_CONFIG.MAX_RETRIES = 3;
  }
};
validateConfig();
const API_CONSTANTS = {
  ADMIN_ROLES: {
    SUPER_ADMIN: "super_admin",
    STUDIO_RENTAL: "studio_rental",
    APARTMENT_SALE: "apartment_sale"
  },
  LOCATIONS: {
    MAADI: "maadi",
    MOKKATTAM: "mokkattam"
  },
  BATHROOM_TYPES: {
    PRIVATE: "private",
    SHARED: "shared"
  },
  PART_STATUS: {
    AVAILABLE: "available",
    RENTED: "rented",
    UPCOMING_END: "upcoming_end"
  },
  FURNISHED_STATUS: {
    YES: "yes",
    NO: "no"
  },
  BALCONY_TYPES: {
    YES: "yes",
    SHARED: "shared",
    NO: "no"
  },
  CUSTOMER_SOURCES: {
    FACEBOOK: "facebook",
    INSTAGRAM: "instagram",
    GOOGLE: "google",
    REFERRAL: "referral",
    WALK_IN: "walk_in",
    OTHER: "other"
  }
};
class ApiClient {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }
  // Create request headers
  createHeaders(includeAuth = true, contentType = "application/json") {
    const headers = {};
    if (contentType) {
      headers["Content-Type"] = contentType;
    }
    if (includeAuth && TokenManager.isAuthenticated()) {
      headers["Authorization"] = `Bearer ${TokenManager.getToken()}`;
    }
    return headers;
  }
  // Handle API responses
  async handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Unknown error" }));
      switch (response.status) {
        case 401:
          TokenManager.removeToken();
          throw new ApiError("Authentication failed", 401, errorData);
        case 403:
          throw new ApiError("Access forbidden", 403, errorData);
        case 404:
          throw new ApiError("Resource not found", 404, errorData);
        case 422:
          throw new ApiError("Validation error", 422, errorData);
        case 500:
          throw new ApiError("Server error", 500, errorData);
        default:
          throw new ApiError("Request failed", response.status, errorData);
      }
    }
    return response.json();
  }
  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const {
      method = "GET",
      body,
      headers = {},
      includeAuth = true,
      contentType = "application/json"
    } = options;
    const requestHeaders = {
      ...this.createHeaders(includeAuth, contentType),
      ...headers
    };
    const config = {
      method,
      headers: requestHeaders
    };
    if (body) {
      if (contentType === "application/json") {
        config.body = JSON.stringify(body);
      } else {
        config.body = body;
      }
    }
    try {
      if (API_CONFIG.ENABLE_LOGGING) {
      }
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      config.signal = controller.signal;
      const response = await fetch(url, config);
      clearTimeout(timeoutId);
      return await this.handleResponse(response);
    } catch (error) {
      if (error.name === "AbortError") {
        throw new ApiError("Request timeout", 408, { detail: "Request timed out" });
      } else if (error.message === "Failed to fetch" || error.message.includes("fetch")) {
        if (body) console.error("   Body at failure:", body);
        throw new ApiError("Network error", 0, { detail: "Failed to connect to backend server" });
      }
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError("Network error", 0, { detail: error.message });
    }
  }
  // HTTP Methods
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url);
  }
  async post(endpoint, data = {}, options = {}) {
    return this.request(endpoint, {
      method: "POST",
      body: data,
      ...options
    });
  }
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: "PUT",
      body: data
    });
  }
  async delete(endpoint) {
    return this.request(endpoint, {
      method: "DELETE"
    });
  }
}
class ApiError extends Error {
  constructor(message, status, data = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
  getDetails() {
    var _a;
    return ((_a = this.data) == null ? void 0 : _a.detail) || this.message;
  }
  getValidationErrors() {
    var _a;
    if (this.status === 422 && Array.isArray((_a = this.data) == null ? void 0 : _a.detail)) {
      return this.data.detail.map((error) => {
        var _a2;
        return {
          field: (_a2 = error.loc) == null ? void 0 : _a2[error.loc.length - 1],
          message: error.msg,
          type: error.type
        };
      });
    }
    return [];
  }
}
const apiClient = new ApiClient();
const authApi = {
  // Login with username/password (form data)
  async login(username, password) {
    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);
    const response = await apiClient.post("/auth/login", formData, {
      contentType: "application/x-www-form-urlencoded",
      includeAuth: false
    });
    if (response.access_token) {
      TokenManager.setToken(response.access_token);
    }
    return response;
  },
  // Create master admin (one-time setup)
  async createMasterAdmin(data) {
    return apiClient.post("/auth/create-master-admin", data, {
      includeAuth: false
    });
  },
  // Validate master admin credentials against static database
  async validateMasterCredentials(identifier, password) {
    try {
      const loginResult = await this.login(identifier, password);
      if (loginResult.access_token) {
        const userProfile = await adminApi.getMe();
        const isMasterAdmin = ["super_admin", "master_admin"].includes(userProfile.role);
        if (!isMasterAdmin) {
          this.logout();
          throw new Error("Access denied: Master admin privileges required");
        }
        return {
          isValid: true,
          user: userProfile,
          token: loginResult.access_token
        };
      }
      return { isValid: false, error: "Invalid credentials" };
    } catch (error) {
      this.logout();
      throw error;
    }
  },
  // Logout
  logout() {
    TokenManager.removeToken();
  },
  // Check authentication status
  isAuthenticated() {
    return TokenManager.isAuthenticated();
  }
};
const adminApi = {
  // Get all admins (super admin only)
  async getAll(params = {}) {
    return apiClient.get("/admins/", params);
  },
  // Get current admin info
  async getMe() {
    return apiClient.get("/admins/me");
  },
  // Update current admin's own information
  async updateMe(data) {
    return apiClient.put("/admins/me", data);
  },
  // Create new admin (super admin only)
  async create(data) {
    return apiClient.post("/admins/", data);
  },
  // Update admin (super admin only)
  async update(adminId, data) {
    return apiClient.put(`/admins/${adminId}`, data);
  },
  // Delete admin (super admin only)
  async delete(adminId) {
    return apiClient.delete(`/admins/${adminId}`);
  }
};
const rentApartmentsApi = {
  // Get all rent apartments
  async getAll(params = {}) {
    return apiClient.get("/apartments/rent", params);
  },
  // Get specific rent apartment
  async getById(apartmentId) {
    return apiClient.get(`/apartments/rent/${apartmentId}`);
  },
  // Create new rent apartment
  async create(data) {
    return apiClient.post("/apartments/rent", data);
  },
  // Update rent apartment
  async update(apartmentId, data) {
    return apiClient.put(`/apartments/rent/${apartmentId}`, data);
  },
  // Delete rent apartment
  async delete(apartmentId) {
    return apiClient.delete(`/apartments/rent/${apartmentId}`);
  }
};
const saleApartmentsApi = {
  // Get all sale apartments
  async getAll(params = {}) {
    return apiClient.get("/apartments/sale", params);
  },
  // Get specific sale apartment
  async getById(apartmentId) {
    return apiClient.get(`/apartments/sale/${apartmentId}`);
  },
  // Create new sale apartment
  async create(data) {
    return apiClient.post("/apartments/sale", data);
  },
  // Update sale apartment
  async update(apartmentId, data) {
    return apiClient.put(`/apartments/sale/${apartmentId}`, data);
  },
  // Delete sale apartment
  async delete(apartmentId) {
    return apiClient.delete(`/apartments/sale/${apartmentId}`);
  }
};
const apartmentPartsApi = {
  // Get all apartment parts
  async getAll(params = {}) {
    return apiClient.get("/apartments/parts", params);
  },
  // Get specific apartment part
  async getById(partId) {
    return apiClient.get(`/apartments/parts/${partId}`);
  },
  // Create new apartment part for rent apartment
  async create(apartmentId, data) {
    return apiClient.post(`/apartments/rent/${apartmentId}/parts`, data);
  },
  // Update apartment part
  async update(partId, data) {
    return apiClient.put(`/apartments/parts/${partId}`, data);
  },
  // Delete apartment part
  async delete(partId) {
    return apiClient.delete(`/apartments/parts/${partId}`);
  }
};
const myContentApi = {
  // Get admin's own apartments and studios
  async getMyContent(params = {}) {
    return apiClient.get("/apartments/my-content", params);
  }
};
const rentalContractsApi = {
  // Get all rental contracts
  async getAll(params = {}) {
    return apiClient.get("/rental-contracts/", params);
  },
  // Get rental contracts by studio (ordered by studio number)
  async getByStudio(params = {}) {
    return apiClient.get("/rental-contracts/by-studio", params);
  },
  // Get specific rental contract
  async getById(contractId) {
    return apiClient.get(`/rental-contracts/${contractId}`);
  },
  // Create new rental contract
  async create(data) {
    const transformedData = dataTransformers.transformContractToApi(data);
    try {
      const response = await apiClient.post("/rental-contracts/", transformedData);
      if (response) {
        return dataTransformers.transformContractFromApi(response);
      }
      return response;
    } catch (error) {
      throw error;
    }
  },
  // Update rental contract
  async update(contractId, data) {
    const transformedData = dataTransformers.transformContractToApi(data);
    const response = await apiClient.put(`/rental-contracts/${contractId}`, transformedData);
    if (response) {
      return dataTransformers.transformContractFromApi(response);
    }
    return response;
  },
  // Delete rental contract (super admin only)
  async delete(contractId) {
    return apiClient.delete(`/rental-contracts/${contractId}`);
  },
  // Renew rental contract
  async renew(contractId, renewalData) {
    return apiClient.post(`/rental-contracts/${contractId}/renew`, renewalData);
  },
  // Record payment for contract
  async recordPayment(contractId, paymentData) {
    return apiClient.post(`/rental-contracts/${contractId}/payments`, paymentData);
  },
  // Get payment history for contract
  async getPayments(contractId) {
    return apiClient.get(`/rental-contracts/${contractId}/payments`);
  },
  // Get contracts due for renewal
  async getDueForRenewal(params = {}) {
    return apiClient.get("/rental-contracts/due-for-renewal", params);
  },
  // Get contracts with overdue payments
  async getOverduePayments(params = {}) {
    return apiClient.get("/rental-contracts/overdue-payments", params);
  },
  // Get contract statistics
  async getStatistics(params = {}) {
    return apiClient.get("/rental-contracts/statistics", params);
  },
  // Generate contract document
  async generateDocument(contractId, documentType = "pdf") {
    return apiClient.get(`/rental-contracts/${contractId}/document`, {
      document_type: documentType
    });
  },
  // Bulk operations
  async bulkUpdate(contractIds, updateData) {
    return apiClient.post("/rental-contracts/bulk-update", {
      contract_ids: contractIds,
      update_data: updateData
    });
  }
};
const dataTransformers = {
  // Transform frontend apartment data to backend format
  transformApartmentToApi(frontendData, type = "rent") {
    const locationValue = convertToApiEnum.location(frontendData.location);
    const bathroomsValue = convertToApiEnum.bathrooms(frontendData.bathrooms);
    try {
      validateEnum(locationValue, LOCATIONS, "location");
      validateEnum(bathroomsValue, BATHROOM_TYPES, "bathrooms");
    } catch (error) {
      throw new Error(`Data validation failed: ${error.message}`);
    }
    return {
      name: frontendData.name || frontendData.title,
      location: locationValue,
      address: frontendData.address,
      area: String(frontendData.area).replace(" sqm", "").replace(/[^0-9.]/g, ""),
      number: frontendData.number || frontendData.unitNumber,
      price: String(frontendData.price).replace(/[^0-9.]/g, ""),
      bedrooms: Number(frontendData.bedrooms) || 1,
      bathrooms: bathroomsValue,
      description: frontendData.description || "",
      photos_url: Array.isArray(frontendData.photos_url) ? frontendData.photos_url : Array.isArray(frontendData.images) ? frontendData.images : [],
      location_on_map: frontendData.location_on_map || frontendData.mapLocation || "",
      facilities_amenities: Array.isArray(frontendData.amenities) ? frontendData.amenities.join(", ") : String(frontendData.facilities_amenities || frontendData.amenities || ""),
      floor: Number(frontendData.floor) || 1,
      total_parts: Number(frontendData.total_parts || frontendData.totalStudios || 1),
      contact_number: frontendData.contact_number || frontendData.contactNumber
    };
  },
  // Transform backend apartment data to frontend format
  transformApartmentFromApi(backendData) {
    return {
      id: backendData.id,
      name: backendData.name,
      title: backendData.name,
      location: convertFromApiEnum.location(backendData.location),
      locationEnum: backendData.location,
      // Keep original enum value for API calls
      address: backendData.address,
      area: backendData.area,
      unitNumber: backendData.number,
      number: backendData.number,
      price: backendData.price,
      bedrooms: backendData.bedrooms,
      bathrooms: convertFromApiEnum.bathrooms(backendData.bathrooms),
      bathroomsEnum: backendData.bathrooms,
      // Keep original enum value for API calls
      description: backendData.description || "",
      images: backendData.photos_url || [],
      photos_url: backendData.photos_url || [],
      mapLocation: backendData.location_on_map,
      location_on_map: backendData.location_on_map,
      amenities: backendData.facilities_amenities ? backendData.facilities_amenities.split(", ") : [],
      facilities_amenities: backendData.facilities_amenities,
      floor: backendData.floor,
      totalStudios: backendData.total_parts,
      total_parts: backendData.total_parts,
      contactNumber: backendData.contact_number,
      contact_number: backendData.contact_number,
      createdBy: backendData.listed_by_admin_id,
      listed_by_admin_id: backendData.listed_by_admin_id,
      createdAt: backendData.created_at,
      updatedAt: backendData.updated_at,
      isAvailable: true,
      type: "Apartment",
      ownership: "Rent",
      completionStatus: "Ready",
      studios: backendData.apartment_parts ? backendData.apartment_parts.map(
        (part) => this.transformStudioFromApi(part)
      ) : []
    };
  },
  // Transform studio part data for API
  transformStudioToApi(frontendData) {
    const bathroomsValue = convertToApiEnum.bathrooms(frontendData.bathrooms);
    const furnishedValue = convertToApiEnum.furnished(frontendData.furnished);
    const balconyValue = convertToApiEnum.balcony(frontendData.balcony);
    const statusValue = convertToApiEnum.status(frontendData.status);
    try {
      validateEnum(bathroomsValue, BATHROOM_TYPES, "bathrooms");
      validateEnum(furnishedValue, FURNISHED_STATUS, "furnished");
      validateEnum(balconyValue, BALCONY_TYPES, "balcony");
      if (statusValue) {
        validateEnum(statusValue, PART_STATUS, "status");
      }
    } catch (error) {
      throw new Error(`Studio data validation failed: ${error.message}`);
    }
    return {
      title: frontendData.title || frontendData.studio_number || frontendData.unitNumber,
      area: String(frontendData.area || "0").replace(" sqm", "").replace(/[^0-9.]/g, ""),
      monthly_price: String(frontendData.monthly_price || frontendData.rent_value || frontendData.price || "0").replace(/[^0-9.]/g, ""),
      bedrooms: Number(frontendData.bedrooms) || 1,
      bathrooms: bathroomsValue,
      furnished: furnishedValue,
      balcony: balconyValue,
      description: frontendData.description || "",
      photos_url: Array.isArray(frontendData.photos_url) ? frontendData.photos_url : Array.isArray(frontendData.images) ? frontendData.images : [],
      status: statusValue || PART_STATUS.AVAILABLE,
      floor: Number(frontendData.floor) || 1
    };
  },
  transformStudioFromApi(backendData) {
    return {
      id: backendData.id,
      apartment_id: backendData.apartment_id,
      title: backendData.title,
      studio_number: backendData.title || backendData.studio_number,
      unitNumber: backendData.title || backendData.studio_number,
      area: backendData.area,
      monthly_price: backendData.monthly_price,
      rent_value: backendData.monthly_price,
      price: backendData.monthly_price,
      bedrooms: backendData.bedrooms,
      bathrooms: convertFromApiEnum.bathrooms(backendData.bathrooms),
      bathroomsEnum: backendData.bathrooms,
      // Keep original for API calls
      furnished: convertFromApiEnum.furnished(backendData.furnished),
      furnishedEnum: backendData.furnished,
      // Keep original for API calls
      balcony: convertFromApiEnum.balcony(backendData.balcony),
      balconyEnum: backendData.balcony,
      // Keep original for API calls
      description: backendData.description || "",
      photos_url: backendData.photos_url || [],
      images: backendData.photos_url || [],
      status: convertFromApiEnum.status(backendData.status),
      statusEnum: backendData.status,
      // Keep original for API calls
      isAvailable: backendData.status === PART_STATUS.AVAILABLE,
      floor: backendData.floor,
      created_by_admin_id: backendData.created_by_admin_id,
      createdBy: backendData.created_by_admin_id,
      created_at: backendData.created_at,
      updated_at: backendData.updated_at
    };
  },
  // Transform rental contract data for API
  transformContractToApi(frontendData) {
    const customerSourceValue = convertToApiEnum.customerSource(frontendData.how_did_customer_find_us || frontendData.customerSource);
    try {
      validateEnum(customerSourceValue, CUSTOMER_SOURCES, "customer_source");
    } catch (error) {
      throw new Error(`Contract data validation failed: ${error.message}`);
    }
    return {
      apartment_part_id: frontendData.apartment_part_id || frontendData.studioId,
      customer_name: frontendData.customer_name || frontendData.customerName,
      customer_phone: frontendData.customer_phone || frontendData.customerPhone,
      customer_id_number: frontendData.customer_id_number || frontendData.customerIdNumber,
      how_did_customer_find_us: customerSourceValue,
      paid_deposit: String(frontendData.paid_deposit || frontendData.deposit || "0").replace(/[^0-9.]/g, ""),
      warrant_amount: String(frontendData.warrant_amount || frontendData.warrantyAmount || "0").replace(/[^0-9.]/g, ""),
      rent_start_date: frontendData.rent_start_date || frontendData.startDate,
      rent_end_date: frontendData.rent_end_date || frontendData.endDate,
      rent_period: Number(frontendData.rent_period || frontendData.contractPeriod || 12),
      contract_url: frontendData.contract_url || frontendData.contractDocument || "",
      customer_id_url: frontendData.customer_id_url || frontendData.customerIdDocument || "",
      commission: String(frontendData.commission || "0").replace(/[^0-9.]/g, ""),
      rent_price: String(frontendData.rent_price || frontendData.monthlyRent || "0").replace(/[^0-9.]/g, "")
    };
  },
  // Transform rental contract data from API
  transformContractFromApi(backendData) {
    return {
      id: backendData.id,
      apartment_part_id: backendData.apartment_part_id,
      studioId: backendData.apartment_part_id,
      customer_name: backendData.customer_name,
      customerName: backendData.customer_name,
      customer_phone: backendData.customer_phone,
      customerPhone: backendData.customer_phone,
      customer_id_number: backendData.customer_id_number,
      customerIdNumber: backendData.customer_id_number,
      how_did_customer_find_us: convertFromApiEnum.customerSource(backendData.how_did_customer_find_us),
      customerSource: convertFromApiEnum.customerSource(backendData.how_did_customer_find_us),
      customerSourceEnum: backendData.how_did_customer_find_us,
      // Keep original for API calls
      paid_deposit: backendData.paid_deposit,
      deposit: backendData.paid_deposit,
      warrant_amount: backendData.warrant_amount,
      warrantyAmount: backendData.warrant_amount,
      rent_start_date: backendData.rent_start_date,
      startDate: backendData.rent_start_date,
      rent_end_date: backendData.rent_end_date,
      endDate: backendData.rent_end_date,
      rent_period: backendData.rent_period,
      contract_url: backendData.contract_url,
      contractDocument: backendData.contract_url,
      customer_id_url: backendData.customer_id_url,
      customerIdDocument: backendData.customer_id_url,
      commission: backendData.commission,
      rent_price: backendData.rent_price,
      monthlyRent: backendData.rent_price,
      is_active: backendData.is_active,
      isActive: backendData.is_active,
      created_by_admin_id: backendData.created_by_admin_id,
      createdBy: backendData.created_by_admin_id,
      created_at: backendData.created_at,
      updated_at: backendData.updated_at
    };
  },
  // Transform admin data for API
  transformAdminToApi(frontendData) {
    const roleValue = convertToApiEnum.adminRole(frontendData.role);
    try {
      validateEnum(roleValue, ADMIN_ROLES, "admin_role");
    } catch (error) {
      throw new Error(`Admin data validation failed: ${error.message}`);
    }
    return {
      full_name: frontendData.full_name || frontendData.fullName || frontendData.name,
      email: frontendData.email,
      phone: frontendData.phone,
      password: frontendData.password,
      role: roleValue
    };
  },
  // Transform admin data from API
  transformAdminFromApi(backendData) {
    return {
      id: backendData.id,
      full_name: backendData.full_name,
      fullName: backendData.full_name,
      name: backendData.full_name,
      email: backendData.email,
      phone: backendData.phone,
      role: convertFromApiEnum.adminRole(backendData.role),
      roleEnum: backendData.role,
      // Keep original for API calls
      created_at: backendData.created_at,
      updated_at: backendData.updated_at
    };
  }
};
const handleApiError = (error, defaultMessage = "An error occurred") => {
  var _a;
  if (error instanceof ApiError) {
    if (error.status === 422) {
      const validationErrors = error.getValidationErrors();
      if (validationErrors.length > 0) {
        return validationErrors.map((err) => `${err.field}: ${err.message}`).join(", ");
      }
    }
    switch (error.status) {
      case 0:
        return "Unable to connect to server. Please check if the backend is running and try again.";
      case 400:
        return "Invalid request. Please check your input and try again.";
      case 401:
        return "Authentication failed. Please log in again.";
      case 403:
        return "You do not have permission to perform this action.";
      case 404:
        return "The requested resource was not found.";
      case 409:
        return "Conflict: This action cannot be completed due to a conflict with existing data.";
      case 422:
        return "Validation failed. Please check your input.";
      case 429:
        return "Too many requests. Please wait a moment and try again.";
      case 500:
        return "Server error. Please try again later or contact support.";
      case 502:
      case 503:
      case 504:
        return "Service temporarily unavailable. Please try again later.";
      default:
        return error.getDetails() || defaultMessage;
    }
  }
  if (error.name === "NetworkError" || error.message === "Failed to fetch") {
    return "Cannot connect to backend server. Please ensure your backend is running on the configured URL.";
  }
  if (error.name === "TimeoutError") {
    return "Request timed out. Please check your backend server and try again.";
  }
  if ((_a = error.message) == null ? void 0 : _a.includes("CORS")) {
    return "CORS error. Please check your backend CORS configuration.";
  }
  return error.message || defaultMessage;
};
const getOperationErrorMessage = (operation, error) => {
  const baseMessage = handleApiError(error);
  const operationMessages = {
    login: "Login failed",
    signup: "Account creation failed",
    create: "Failed to create item",
    update: "Failed to update item",
    delete: "Failed to delete item",
    fetch: "Failed to load data",
    upload: "Failed to upload file",
    search: "Search failed"
  };
  const prefix = operationMessages[operation] || "Operation failed";
  if (baseMessage.includes(":")) {
    return baseMessage;
  }
  return `${prefix}: ${baseMessage}`;
};
const createRetryFunction = (apiCall, maxRetries = API_CONFIG.MAX_RETRIES || 3, delay = 1e3) => {
  return async (...args) => {
    let lastError;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (API_CONFIG.ENABLE_LOGGING && attempt > 0) {
        }
        return await apiCall(...args);
      } catch (error) {
        lastError = error;
        if (error instanceof ApiError && error.status >= 400 && error.status < 500 && error.status !== 429) {
          throw error;
        }
        if (attempt === maxRetries) {
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, delay * (attempt + 1)));
      }
    }
    throw lastError;
  };
};
const api = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  API_CONSTANTS,
  ApiError,
  adminApi,
  apartmentPartsApi,
  authApi,
  createRetryFunction,
  dataTransformers,
  default: apiClient,
  getOperationErrorMessage,
  handleApiError,
  myContentApi,
  rentApartmentsApi,
  rentalContractsApi,
  saleApartmentsApi
}, Symbol.toStringTag, { value: "Module" }));
class MasterAuthService {
  constructor() {
    this.isAuthenticating = false;
    this.lastAuthAttempt = null;
  }
  /**
   * Authenticate master admin with comprehensive validation
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.identifier - Email or phone number
   * @param {string} credentials.password - Password
   * @returns {Promise<Object>} Authentication result
   */
  async authenticateMasterAdmin(credentials) {
    const { identifier, password } = credentials;
    if (this.isAuthenticating) {
      throw new Error("Authentication already in progress");
    }
    this.isAuthenticating = true;
    this.lastAuthAttempt = /* @__PURE__ */ new Date();
    try {
      const validationResult = this.validateCredentials(identifier, password);
      if (!validationResult.isValid) {
        throw new Error(validationResult.error);
      }
      await this.validateWithBackend(identifier, password);
      const userProfile = await this.fetchUserProfile();
      const roleValidation = this.validateMasterRole(userProfile);
      if (!roleValidation.isValid) {
        authApi.logout();
        throw new Error(roleValidation.error);
      }
      const crossValidation = this.crossValidateCredentials(identifier, userProfile);
      if (!crossValidation.isValid) {
        authApi.logout();
        throw new Error(crossValidation.error);
      }
      const securityCheck = this.performSecurityChecks(userProfile);
      if (!securityCheck.isValid) {
        authApi.logout();
        throw new Error(securityCheck.error);
      }
      const successResult = {
        success: true,
        user: userProfile,
        loginTime: (/* @__PURE__ */ new Date()).toISOString(),
        authMethod: this.determineIdentifierType(identifier),
        sessionId: this.generateSessionId()
      };
      return successResult;
    } catch (error) {
      console.error("❌ Master Admin Authentication Failed", {
        identifier,
        error: error.message,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
      authApi.logout();
      throw new Error(this.formatErrorMessage(error));
    } finally {
      this.isAuthenticating = false;
    }
  }
  /**
   * Validate credential format
   * @param {string} identifier - Email or phone
   * @param {string} password - Password
   * @returns {Object} Validation result
   */
  validateCredentials(identifier, password) {
    if (!identifier || !password) {
      return {
        isValid: false,
        error: "Email/phone and password are required"
      };
    }
    if (password.length < 6) {
      return {
        isValid: false,
        error: "Password must be at least 6 characters long"
      };
    }
    const isEmail = identifier.includes("@");
    const isPhone = /^(\+20|0)?1[0-9]{9}$/.test(identifier.replace(/\s/g, ""));
    if (!isEmail && !isPhone) {
      return {
        isValid: false,
        error: "Please enter a valid email address or Egyptian mobile number"
      };
    }
    return { isValid: true };
  }
  /**
   * Validate credentials against backend
   * @param {string} identifier - Email or phone
   * @param {string} password - Password
   * @returns {Promise<Object>} Authentication result
   */
  async validateWithBackend(identifier, password) {
    try {
      const loginResponse = await authApi.login(identifier, password);
      if (!loginResponse.access_token) {
        throw new Error("No access token received from backend");
      }
      return {
        success: true,
        token: loginResponse.access_token,
        tokenType: loginResponse.token_type
      };
    } catch (error) {
      if (error.status === 401) {
        throw new Error("Invalid email/phone or password. Please check your credentials.");
      } else if (error.status === 422) {
        throw new Error("Invalid input format. Please check your email or phone number.");
      } else if (error.status === 404) {
        throw new Error("Account not found. Please verify your credentials.");
      } else {
        throw new Error("Authentication service unavailable. Please try again later.");
      }
    }
  }
  /**
   * Fetch user profile from backend
   * @returns {Promise<Object>} User profile
   */
  async fetchUserProfile() {
    try {
      const userProfile = await adminApi.getMe();
      return userProfile;
    } catch (error) {
      throw new Error("Failed to retrieve user profile from database");
    }
  }
  /**
   * Validate master admin role
   * @param {Object} userProfile - User profile from backend
   * @returns {Object} Validation result
   */
  validateMasterRole(userProfile) {
    const validRoles = ["super_admin", "master_admin"];
    if (!userProfile.role || !validRoles.includes(userProfile.role)) {
      return {
        isValid: false,
        error: `Access denied: Master admin privileges required. Current role: ${userProfile.role || "undefined"}`
      };
    }
    return { isValid: true };
  }
  /**
   * Cross-validate login credentials with user profile
   * @param {string} identifier - Login identifier
   * @param {Object} userProfile - User profile from backend
   * @returns {Object} Validation result
   */
  crossValidateCredentials(identifier, userProfile) {
    var _a, _b;
    const isEmail = identifier.includes("@");
    if (isEmail) {
      const profileEmail = (_a = userProfile.email) == null ? void 0 : _a.toLowerCase();
      const inputEmail = identifier.toLowerCase();
      if (profileEmail !== inputEmail) {
        return {
          isValid: false,
          error: "Email validation failed: Login email does not match profile"
        };
      }
    } else {
      const normalizedInputPhone = identifier.replace(/[^0-9+]/g, "");
      const normalizedProfilePhone = (_b = userProfile.phone) == null ? void 0 : _b.replace(/[^0-9+]/g, "");
      if (normalizedProfilePhone !== normalizedInputPhone) {
        return {
          isValid: false,
          error: "Phone validation failed: Login phone does not match profile"
        };
      }
    }
    return { isValid: true };
  }
  /**
   * Perform additional security checks
   * @param {Object} userProfile - User profile
   * @returns {Object} Security check result
   */
  performSecurityChecks(userProfile) {
    if (!userProfile.email && !userProfile.phone) {
      return {
        isValid: false,
        error: "Invalid user profile: Missing contact information"
      };
    }
    if (!userProfile.full_name) {
      return {
        isValid: false,
        error: "Invalid user profile: Missing user information"
      };
    }
    if (userProfile.status === "inactive" || userProfile.is_active === false) {
      return {
        isValid: false,
        error: "Account is inactive. Please contact system administrator."
      };
    }
    return { isValid: true };
  }
  /**
   * Determine identifier type (email or phone)
   * @param {string} identifier - Login identifier
   * @returns {string} Type ('email' or 'phone')
   */
  determineIdentifierType(identifier) {
    return identifier.includes("@") ? "email" : "phone";
  }
  /**
   * Generate unique session ID
   * @returns {string} Session ID
   */
  generateSessionId() {
    return `mas_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  /**
   * Format error message for user display
   * @param {Error} error - Original error
   * @returns {string} Formatted error message
   */
  formatErrorMessage(error) {
    const message = error.message || "Authentication failed";
    if (message.includes("network") || message.includes("fetch")) {
      return "Network connection error. Please check your internet connection and try again.";
    }
    if (message.includes("timeout")) {
      return "Authentication request timed out. Please try again.";
    }
    return message;
  }
  /**
   * Check if user is currently authenticated
   * @returns {boolean} Authentication status
   */
  isCurrentlyAuthenticated() {
    return authApi.isAuthenticated();
  }
  /**
   * Log out current user
   */
  logout() {
    authApi.logout();
  }
  /**
   * Get authentication statistics
   * @returns {Object} Auth statistics
   */
  getAuthStats() {
    return {
      lastAuthAttempt: this.lastAuthAttempt,
      isAuthenticating: this.isAuthenticating,
      isAuthenticated: this.isCurrentlyAuthenticated()
    };
  }
}
const masterAuthService = new MasterAuthService();
const initialState$1 = {
  currentUser: null,
  isLoading: false,
  error: null,
  initialized: false
};
const masterAuthSlice = createSlice({
  name: "masterAuth",
  initialState: initialState$1,
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
      authApi.logout();
    },
    initializeApp: (state) => {
      if (!state.initialized) {
        state.initialized = true;
      }
    }
  },
  extraReducers: (builder) => {
    builder.addCase(initializeMasterAuth.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    }).addCase(initializeMasterAuth.fulfilled, (state, action) => {
      state.isLoading = false;
      state.initialized = true;
      if (action.payload.currentUser) {
        state.currentUser = action.payload.currentUser;
      } else {
        state.currentUser = null;
      }
    }).addCase(initializeMasterAuth.rejected, (state, action) => {
      state.isLoading = false;
      state.initialized = true;
      state.currentUser = null;
      state.error = action.payload;
    }).addCase(loginMasterAdmin.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    }).addCase(loginMasterAdmin.fulfilled, (state, action) => {
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
        lastActivity: (/* @__PURE__ */ new Date()).toISOString()
      };
      state.initialized = true;
    }).addCase(loginMasterAdmin.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
      state.currentUser = null;
    }).addCase(updateMasterProfile.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    }).addCase(updateMasterProfile.fulfilled, (state, action) => {
      state.isLoading = false;
      if (state.currentUser) {
        state.currentUser = {
          ...state.currentUser,
          email: action.payload.user.email,
          full_name: action.payload.user.full_name,
          phone: action.payload.user.phone,
          lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
        };
      }
    }).addCase(updateMasterProfile.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });
  }
});
const {
  setLoading,
  setError,
  clearError,
  logout,
  initializeApp
} = masterAuthSlice.actions;
const initializeMasterAuth = createAsyncThunk(
  "masterAuth/initialize",
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
            loginTime: (/* @__PURE__ */ new Date()).toISOString(),
            lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
          },
          isFirstTimeSetup: false
        };
      }
      return { currentUser: null, isFirstTimeSetup: true };
    } catch (error) {
      return rejectWithValue({
        message: error.message || "Initialization failed",
        status: error.status
      });
    }
  }
);
const loginMasterAdmin = createAsyncThunk(
  "masterAuth/login",
  async (loginData, { rejectWithValue }) => {
    try {
      const { email, username, password } = loginData;
      const identifier = email || username;
      const authResult = await masterAuthService.authenticateMasterAdmin({
        identifier,
        password
      });
      if (authResult.success) {
        return {
          user: authResult.user,
          authMethod: authResult.authMethod,
          sessionId: authResult.sessionId,
          loginTime: authResult.loginTime
        };
      } else {
        throw new Error("Authentication service failed");
      }
    } catch (error) {
      masterAuthService.logout();
      return rejectWithValue(error.message || "Authentication failed. Please try again.");
    }
  }
);
const updateMasterProfile = createAsyncThunk(
  "masterAuth/updateProfile",
  async ({ email, currentPassword, newPassword }, { getState, rejectWithValue }) => {
    var _a, _b;
    try {
      const { masterAuth } = getState();
      if (!masterAuth.currentUser) {
        return rejectWithValue("Not authenticated");
      }
      const updateData = {};
      if (email !== masterAuth.currentUser.email) {
        const emailToUpdate = email.toLowerCase().trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailToUpdate)) {
          return rejectWithValue("Please enter a valid email address");
        }
        updateData.email = emailToUpdate;
      }
      if (newPassword && newPassword.trim().length > 0) {
        updateData.password = newPassword.trim();
      }
      if (Object.keys(updateData).length === 0) {
        return rejectWithValue("No changes detected");
      }
      Object.keys(updateData).forEach((key) => {
        if (updateData[key] === void 0 || updateData[key] === null || updateData[key] === "") {
          delete updateData[key];
        }
      });
      const updatedUser = await adminApi.updateMe(updateData);
      return { user: updatedUser };
    } catch (error) {
      if (error.status === 422) {
        console.error("❌ Validation errors:", (_a = error.getValidationErrors) == null ? void 0 : _a.call(error));
        if (Array.isArray((_b = error.data) == null ? void 0 : _b.detail)) {
          error.data.detail.forEach((validationError, index) => {
          });
        }
      }
      const errorMessage = handleApiError(error, "Update failed. Please try again.");
      return rejectWithValue(errorMessage);
    }
  }
);
const selectCurrentUser = (state) => state.masterAuth.currentUser;
const selectMasterLoading = (state) => state.masterAuth.isLoading;
const selectMasterError = (state) => state.masterAuth.error;
const selectIsMasterAuthenticated = (state) => !!state.masterAuth.currentUser && authApi.isAuthenticated();
const selectCurrentUserProfile = (state) => {
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
const masterAuthReducer = masterAuthSlice.reducer;
const THEME_STORAGE_KEY = "app_theme";
const isBrowser = typeof window !== "undefined";
const getStoredTheme = () => {
  if (!isBrowser) return "light";
  try {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    return storedTheme || "light";
  } catch (error) {
    return "light";
  }
};
const saveTheme = (theme) => {
  if (!isBrowser) return;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (error) {
  }
};
const initialState = {
  currentTheme: getStoredTheme(),
  availableThemes: ["light", "dark"],
  systemPreference: "light",
  // Could be detected from system
  customThemes: []
  // For future custom theme support
};
const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme: (state, action) => {
      const newTheme = action.payload;
      if (state.availableThemes.includes(newTheme)) {
        state.currentTheme = newTheme;
        saveTheme(newTheme);
      }
    },
    toggleTheme: (state) => {
      const newTheme = state.currentTheme === "light" ? "dark" : "light";
      state.currentTheme = newTheme;
      saveTheme(newTheme);
    },
    setSystemPreference: (state, action) => {
      state.systemPreference = action.payload;
    },
    useSystemTheme: (state) => {
      state.currentTheme = state.systemPreference;
      saveTheme(state.systemPreference);
    },
    addCustomTheme: (state, action) => {
      const { name, config } = action.payload;
      const existingIndex = state.customThemes.findIndex((theme) => theme.name === name);
      if (existingIndex !== -1) {
        state.customThemes[existingIndex] = { name, config };
      } else {
        state.customThemes.push({ name, config });
        state.availableThemes.push(name);
      }
    },
    removeCustomTheme: (state, action) => {
      const themeName = action.payload;
      state.customThemes = state.customThemes.filter((theme) => theme.name !== themeName);
      state.availableThemes = state.availableThemes.filter((theme) => theme !== themeName);
      if (state.currentTheme === themeName) {
        state.currentTheme = "light";
        saveTheme("light");
      }
    },
    resetToDefault: (state) => {
      state.currentTheme = "light";
      state.customThemes = [];
      state.availableThemes = ["light", "dark"];
      saveTheme("light");
    }
  }
});
const {
  setTheme,
  toggleTheme,
  setSystemPreference,
  useSystemTheme,
  addCustomTheme,
  removeCustomTheme,
  resetToDefault
} = themeSlice.actions;
const detectSystemTheme = () => (dispatch) => {
  try {
    if (typeof window !== "undefined" && window.matchMedia) {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
      const systemTheme = prefersDark.matches ? "dark" : "light";
      dispatch(setSystemPreference(systemTheme));
      prefersDark.addEventListener("change", (e) => {
        const newSystemTheme = e.matches ? "dark" : "light";
        dispatch(setSystemPreference(newSystemTheme));
      });
      return systemTheme;
    }
  } catch (error) {
  }
  return "light";
};
const themeReducer = themeSlice.reducer;
var define_process_env_default$2 = { NODE_ENV: "production" };
const store = configureStore({
  reducer: {
    property: propertyReducer,
    adminAuth: adminAuthReducer,
    masterAuth: masterAuthReducer,
    theme: themeReducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: {
      // Ignore these action types for non-serializable values
      ignoredActionsPaths: ["payload.timestamp"],
      ignoredPaths: ["adminAuth.currentAdmin.loginTime", "masterAuth.currentUser.loginTime"]
    }
  }).concat(localStorageMiddleware),
  // Add localStorage middleware
  devTools: define_process_env_default$2.NODE_ENV !== "production"
});
const ToastNotification = ({ message, type = "info", duration = 4e3, onClose, autoClose = true }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 300);
  }, [onClose]);
  useEffect(() => {
    if (autoClose && duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, autoClose, handleClose]);
  const getIcon = () => {
    switch (type) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "warning":
        return "⚠️";
      case "info":
      default:
        return "ℹ️";
    }
  };
  if (!isVisible) {
    return null;
  }
  return /* @__PURE__ */ jsx("div", { className: `toast toast-${type} ${isExiting ? "toast-exit" : ""}`, children: /* @__PURE__ */ jsxs("div", { className: "toast-content", children: [
    /* @__PURE__ */ jsx("span", { className: "toast-icon", children: getIcon() }),
    /* @__PURE__ */ jsx("span", { className: "toast-message", children: message }),
    /* @__PURE__ */ jsx(
      "button",
      {
        className: "toast-close",
        onClick: handleClose,
        "aria-label": "Close notification",
        children: "×"
      }
    )
  ] }) });
};
const ToastContext = createContext();
const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);
  const addToast = useCallback((message, type = "info", options = {}) => {
    const id = Date.now() + Math.random();
    const toast = {
      id,
      message,
      type,
      duration: 4e3,
      autoClose: true,
      ...options
    };
    setToasts((current) => [...current, toast]);
    if (toast.autoClose && toast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration);
    }
    return id;
  }, [removeToast]);
  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);
  const showSuccess = useCallback((message, options = {}) => addToast(message, "success", options), [addToast]);
  const showError = useCallback((message, options = {}) => addToast(message, "error", { duration: 6e3, ...options }), [addToast]);
  const showWarning = useCallback((message, options = {}) => addToast(message, "warning", { duration: 5e3, ...options }), [addToast]);
  const showInfo = useCallback((message, options = {}) => addToast(message, "info", options), [addToast]);
  const contextValue = {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
  return /* @__PURE__ */ jsxs(ToastContext.Provider, { value: contextValue, children: [
    children,
    /* @__PURE__ */ jsx("div", { className: "toast-container", children: toasts.map((toast) => /* @__PURE__ */ jsx(
      ToastNotification,
      {
        message: toast.message,
        type: toast.type,
        duration: toast.duration,
        autoClose: toast.autoClose,
        onClose: () => removeToast(toast.id)
      },
      toast.id
    )) })
  ] });
};
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    __publicField(this, "handleRetry", () => {
      this.setState({ hasError: false, error: null, errorInfo: null });
    });
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });
  }
  render() {
    if (this.state.hasError) {
      return /* @__PURE__ */ jsx("div", { className: "error-boundary", children: /* @__PURE__ */ jsxs("div", { className: "error-boundary-content", children: [
        /* @__PURE__ */ jsx("div", { className: "error-icon", children: "⚠️" }),
        /* @__PURE__ */ jsx("h2", { children: "Something went wrong" }),
        /* @__PURE__ */ jsx("p", { children: "We're sorry, but something unexpected happened." }),
        this.props.showDetails && this.state.error && /* @__PURE__ */ jsxs("details", { className: "error-details", children: [
          /* @__PURE__ */ jsx("summary", { children: "Error Details (for developers)" }),
          /* @__PURE__ */ jsxs("div", { className: "error-stack", children: [
            /* @__PURE__ */ jsx("strong", { children: "Error:" }),
            " ",
            this.state.error.toString(),
            /* @__PURE__ */ jsx("br", {}),
            /* @__PURE__ */ jsx("strong", { children: "Stack Trace:" }),
            /* @__PURE__ */ jsx("pre", { children: this.state.errorInfo.componentStack })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "error-actions", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              className: "btn btn--primary",
              onClick: this.handleRetry,
              children: "Try Again"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              className: "btn btn--secondary",
              onClick: () => window.location.reload(),
              children: "Reload Page"
            }
          )
        ] })
      ] }) });
    }
    return this.props.children;
  }
}
const heroImg = "/assets/LP-BxRQ1oxP.jpg";
const aygLogo = "/assets/AYG-CPt_XWio.png";
function LandingPage() {
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 50) {
        setIsNavVisible(true);
      } else if (currentScrollY > lastScrollY) {
        setIsNavVisible(false);
      } else {
        setIsNavVisible(true);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);
  return /* @__PURE__ */ jsxs("main", { className: "landing", children: [
    /* @__PURE__ */ jsxs("nav", { className: `landing__nav ${isNavVisible ? "nav-visible" : "nav-hidden"}`, children: [
      /* @__PURE__ */ jsxs("div", { className: "brand", children: [
        /* @__PURE__ */ jsx("img", { src: aygLogo, alt: "AYG Logo", className: "brand-logo" }),
        /* @__PURE__ */ jsx("span", { className: "brand-text", children: "AYG" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "nav-actions", children: [
        /* @__PURE__ */ jsx("a", { className: "nav-link", href: "#options", children: "Services" }),
        /* @__PURE__ */ jsx("a", { className: "nav-link", href: "#contact", children: "Contact" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(
      "section",
      {
        className: "hero",
        style: { backgroundImage: `url(${heroImg})` },
        "aria-label": "AYG — Real Estate",
        children: [
          /* @__PURE__ */ jsx("div", { className: "hero__overlay" }),
          /* @__PURE__ */ jsxs("div", { className: "hero__inner", children: [
            /* @__PURE__ */ jsxs("p", { className: "subtitle", style: { display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", fontSize: "18px", fontWeight: "700" }, children: [
              /* @__PURE__ */ jsx("span", { children: "We help individuals and businesses find the right place to live and invest." }),
              /* @__PURE__ */ jsx("span", { children: "Discover modern studios for rent and premium apartments for sale with transparent" }),
              /* @__PURE__ */ jsx("span", { children: "pricing, clear processes, and dedicated support." })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "cta-group", style: { display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center", alignItems: "center", marginTop: "5%" }, children: /* @__PURE__ */ jsx(
              "button",
              {
                className: "btn btn--primary",
                onClick: () => {
                  var _a;
                  return (_a = document.getElementById("options")) == null ? void 0 : _a.scrollIntoView({ behavior: "smooth" });
                },
                children: "Explore options"
              }
            ) })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxs("section", { className: "options", id: "options", "aria-label": "Choose a service", children: [
      /* @__PURE__ */ jsxs("article", { className: "option-card", children: [
        /* @__PURE__ */ jsx("div", { className: "option-card__media", style: { backgroundImage: `url(${heroImg})` }, "aria-hidden": true }),
        /* @__PURE__ */ jsx("img", { className: "option-card__thumb", src: heroImg, alt: "Studio preview", "aria-hidden": "true" }),
        /* @__PURE__ */ jsx("p", { className: "option-card__text", children: "Explore furnished studios in prime locations with flexible terms and quick move-ins." }),
        /* @__PURE__ */ jsx(Link, { className: "btn btn--primary option-card__btn", to: "/studios", children: "Rent a studio" })
      ] }),
      /* @__PURE__ */ jsxs("article", { className: "option-card", children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "option-card__media option-card__media--brand",
            style: { backgroundImage: `url(${aygLogo})` },
            "aria-hidden": true
          }
        ),
        /* @__PURE__ */ jsx(
          "img",
          {
            className: "option-card__thumb option-card__thumb--brand",
            src: aygLogo,
            alt: "AYG",
            "aria-hidden": "true"
          }
        ),
        /* @__PURE__ */ jsx("p", { className: "option-card__text", children: "Browse our curated apartments for sale with verified listings and expert guidance." }),
        /* @__PURE__ */ jsx(Link, { className: "btn btn--primary option-card__btn", to: "/buy-apartments", children: "Buy an apartment" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("footer", { className: "landing__footer", id: "contact", children: [
      /* @__PURE__ */ jsxs("div", { className: "footer-content", children: [
        /* @__PURE__ */ jsxs("div", { className: "footer-owner", children: [
          /* @__PURE__ */ jsx("h3", { className: "footer-heading", children: "Owner and founder of AYG" }),
          /* @__PURE__ */ jsx("div", { className: "owner-photo", children: /* @__PURE__ */ jsx("img", { src: "/founder.png", alt: "Owner and Founder", className: "founder-img" }) }),
          /* @__PURE__ */ jsx("h3", { children: "Dr. Ahmed Yasser" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "footer-contact", children: [
          /* @__PURE__ */ jsx("h3", { className: "footer-heading", children: "Contact Us" }),
          /* @__PURE__ */ jsxs("div", { className: "contact-links", children: [
            /* @__PURE__ */ jsxs("a", { href: "https://www.facebook.com/share/17UqaGsPuW/?mibextid=wwXIfr", target: "_blank", rel: "noopener noreferrer", className: "contact-item", children: [
              /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faFacebook, className: "contact-icon" }),
              /* @__PURE__ */ jsx("span", { className: "contact-text", children: "Facebook" })
            ] }),
            /* @__PURE__ */ jsxs("a", { href: "https://wa.me/201044465888", target: "_blank", rel: "noopener noreferrer", className: "contact-item", children: [
              /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faWhatsapp, className: "contact-icon" }),
              /* @__PURE__ */ jsx("span", { className: "contact-text", children: "01044465888" })
            ] }),
            /* @__PURE__ */ jsxs("a", { href: "https://maps.app.goo.gl/9LYfAyt5MxHnmEyv5?g_st=ipc", target: "_blank", rel: "noopener noreferrer", className: "contact-item", children: [
              /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faMapMarkerAlt, className: "contact-icon" }),
              /* @__PURE__ */ jsx("span", { className: "contact-text", children: "Location on Google Maps" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "footer-info", children: [
          /* @__PURE__ */ jsx("h3", { className: "footer-heading", children: "How to find us" }),
          /* @__PURE__ */ jsx("div", { className: "info-item", children: /* @__PURE__ */ jsx("p", { className: "info-text", children: "مواعيد العمل من ١١ صباح ل ٩ مساءا" }) }),
          /* @__PURE__ */ jsxs("div", { className: "info-item", children: [
            /* @__PURE__ */ jsx("p", { className: "info-text", children: "العنوان : الهضبة الوسطي - المقطم - شارع الجامعة الحديثة" }),
            /* @__PURE__ */ jsx("p", { className: "info-text", children: "مبني رقم 6458 امام شركة الحمد" }),
            /* @__PURE__ */ jsx("p", { className: "info-text", children: "الدور الاول" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "footer-bottom", children: /* @__PURE__ */ jsxs("p", { children: [
        "© ",
        (/* @__PURE__ */ new Date()).getFullYear(),
        " ",
        /* @__PURE__ */ jsx("img", { src: aygLogo, alt: "AYG", className: "footer-logo-inline" }),
        " All rights reserved."
      ] }) })
    ] })
  ] });
}
const BackButton = ({
  text = "← Back",
  to,
  onClick,
  variant = "default",
  className = "",
  disabled = false,
  asLink = false
}) => {
  const navigate = useNavigate();
  const handleClick = (e) => {
    if (disabled) return;
    if (onClick) {
      onClick(e);
    } else if (to) {
      e.preventDefault();
      navigate(to);
    } else {
      navigate(-1);
    }
  };
  const buttonClasses = `back-button back-button--${variant} ${className} ${disabled ? "back-button--disabled" : ""}`;
  if (asLink && to && !disabled) {
    return /* @__PURE__ */ jsx(
      Link,
      {
        to,
        className: buttonClasses,
        onClick,
        children: text
      }
    );
  }
  return /* @__PURE__ */ jsx(
    "button",
    {
      className: buttonClasses,
      onClick: handleClick,
      disabled,
      children: text
    }
  );
};
const StudioCard = ({ studio }) => {
  const handleCardClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const path = `/studio/${studio.id}?source=customer-studios`;
    window.location.assign(path);
  }, [studio.id]);
  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200"%3E%3Crect width="300" height="200" fill="%23e2e8f0"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="%23718096"%3ENo Image Available%3C/text%3E%3C/svg%3E';
  };
  const getImageSrc = () => {
    const imgSrc = studio.images[0];
    if (!imgSrc || imgSrc.startsWith("blob:")) {
      return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200"%3E%3Crect width="300" height="200" fill="%23e2e8f0"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="%23718096"%3ENo Image Available%3C/text%3E%3C/svg%3E';
    }
    return imgSrc;
  };
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "studio-card",
      onClick: handleCardClick,
      style: { cursor: "pointer" },
      children: [
        /* @__PURE__ */ jsxs("div", { className: "studio-card__image", children: [
          /* @__PURE__ */ jsx(
            "img",
            {
              src: getImageSrc(),
              alt: studio.title,
              onError: handleImageError
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "studio-card__image-count", children: [
            /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faCamera }),
            " See ",
            studio.images.length,
            " photos"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "studio-card__content", children: [
          /* @__PURE__ */ jsx("div", { className: "studio-card__price", children: studio.price }),
          /* @__PURE__ */ jsx("h3", { className: "studio-card__title", children: studio.title }),
          /* @__PURE__ */ jsxs("div", { className: "studio-card__details", children: [
            /* @__PURE__ */ jsxs("span", { className: "detail-item", children: [
              /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faBed }),
              " ",
              studio.bedrooms
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "detail-item", children: [
              /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faShower }),
              " ",
              studio.bathrooms
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "detail-item", children: [
              /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faRuler }),
              " ",
              studio.area
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "studio-card__location", children: [
            /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faMapMarkerAlt }),
            " ",
            studio.location
          ] }),
          /* @__PURE__ */ jsx("div", { className: "studio-card__posted", children: studio.postedDate })
        ] })
      ]
    }
  );
};
const Footer = () => {
  return /* @__PURE__ */ jsxs("footer", { className: "landing__footer", id: "contact", children: [
    /* @__PURE__ */ jsxs("div", { className: "footer-content", children: [
      /* @__PURE__ */ jsxs("div", { className: "footer-owner", children: [
        /* @__PURE__ */ jsx("h3", { className: "footer-heading", children: "Owner and founder of AYG" }),
        /* @__PURE__ */ jsx("div", { className: "owner-photo", children: /* @__PURE__ */ jsx("img", { src: "/founder.png", alt: "Owner and Founder", className: "founder-img" }) }),
        /* @__PURE__ */ jsx("h3", { children: "Dr. Ahmed Yasser" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "footer-contact", children: [
        /* @__PURE__ */ jsx("h3", { className: "footer-heading", children: "Contact Us" }),
        /* @__PURE__ */ jsxs("div", { className: "contact-links", children: [
          /* @__PURE__ */ jsxs("a", { href: "https://www.facebook.com/share/17UqaGsPuW/?mibextid=wwXIfr", target: "_blank", rel: "noopener noreferrer", className: "contact-item", children: [
            /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faFacebook, className: "contact-icon" }),
            /* @__PURE__ */ jsx("span", { className: "contact-text", children: "Facebook" })
          ] }),
          /* @__PURE__ */ jsxs("a", { href: "https://wa.me/201044465888", target: "_blank", rel: "noopener noreferrer", className: "contact-item", children: [
            /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faWhatsapp, className: "contact-icon" }),
            /* @__PURE__ */ jsx("span", { className: "contact-text", children: "01044465888" })
          ] }),
          /* @__PURE__ */ jsxs("a", { href: "https://maps.app.goo.gl/9LYfAyt5MxHnmEyv5?g_st=ipc", target: "_blank", rel: "noopener noreferrer", className: "contact-item", children: [
            /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faMapMarkerAlt, className: "contact-icon" }),
            /* @__PURE__ */ jsx("span", { className: "contact-text", children: "Location on Google Maps" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "footer-info", children: [
        /* @__PURE__ */ jsx("h3", { className: "footer-heading", children: "How to find us" }),
        /* @__PURE__ */ jsx("div", { className: "info-item", children: /* @__PURE__ */ jsx("p", { className: "info-text", children: "مواعيد العمل من ١١ صباح ل ٩ مساءا" }) }),
        /* @__PURE__ */ jsxs("div", { className: "info-item", children: [
          /* @__PURE__ */ jsx("p", { className: "info-text", children: "العنوان : الهضبة الوسطي - المقطم - شارع الجامعة الحديثة" }),
          /* @__PURE__ */ jsx("p", { className: "info-text", children: "مبني رقم 6458 امام شركة الحمد" }),
          /* @__PURE__ */ jsx("p", { className: "info-text", children: "الدور الاول" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "footer-bottom", children: /* @__PURE__ */ jsxs("p", { children: [
      "© ",
      (/* @__PURE__ */ new Date()).getFullYear(),
      " ",
      /* @__PURE__ */ jsx("img", { src: aygLogo, alt: "AYG", className: "footer-logo-inline" }),
      " All rights reserved."
    ] }) })
  ] });
};
const FALLBACK_STUDIO_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200"%3E%3Crect width="300" height="200" fill="%23e2e8f0"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="%23718096"%3ENo Image Available%3C/text%3E%3C/svg%3E';
const StudiosListPage = () => {
  const isRenderableImageUrl = (url) => {
    if (typeof url !== "string" || !url.trim()) return false;
    if (url.startsWith("blob:")) return false;
    if (url.includes("example.com")) return false;
    return true;
  };
  const [allStudios, setAllStudios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError2] = useState(null);
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [displayedStudios, setDisplayedStudios] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const STUDIOS_PER_PAGE = 10;
  const transformApartmentPartToStudio = (part) => {
    var _a;
    const monthlyPrice = part.monthly_price || part.price || part.rent_price || 0;
    const formattedPrice = `EGP ${parseFloat(monthlyPrice).toLocaleString()}/month`;
    const areaValue = part.area || part.size || "0";
    const formattedArea = `${areaValue} sqm`;
    const createdDate = part.created_at || part.createdAt || /* @__PURE__ */ new Date();
    const postedDate = new Date(createdDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
    const imageUrls = part.photos_url || part.images || [];
    const images = Array.isArray(imageUrls) && imageUrls.length > 0 ? imageUrls.filter(isRenderableImageUrl) : [FALLBACK_STUDIO_IMAGE];
    const safeImages = images.length > 0 ? images : [FALLBACK_STUDIO_IMAGE];
    let location = "Location not specified";
    let locationEnum = null;
    if (part.location) {
      locationEnum = part.location;
      location = convertFromApiEnum.location(part.location);
    } else if (part.apartment && part.apartment.location) {
      locationEnum = part.apartment.location;
      location = convertFromApiEnum.location(part.apartment.location);
    }
    const bathroomsDisplay = part.bathrooms ? convertFromApiEnum.bathrooms(part.bathrooms) : "Private";
    const furnishedDisplay = part.furnished ? convertFromApiEnum.furnished(part.furnished) : false;
    const balconyDisplay = part.balcony ? convertFromApiEnum.balcony(part.balcony) : "No";
    const statusDisplay = part.status ? convertFromApiEnum.status(part.status) : "Available";
    return {
      id: part.id || part._id,
      title: part.title || part.name || "Studio",
      location,
      locationEnum,
      // Keep for filtering
      price: formattedPrice,
      pricePerMonth: parseFloat(monthlyPrice),
      area: formattedArea,
      bedrooms: part.bedrooms || 1,
      bathrooms: bathroomsDisplay,
      bathroomsEnum: part.bathrooms,
      // Keep for API calls
      furnished: furnishedDisplay,
      furnishedEnum: part.furnished,
      // Keep for API calls
      balcony: balconyDisplay,
      balconyEnum: part.balcony,
      // Keep for API calls
      amenities: ((_a = part.facilities_amenities) == null ? void 0 : _a.split(", ")) || [],
      images: safeImages,
      description: part.description || "No description available",
      createdBy: part.created_by_admin_id || part.createdBy || null,
      createdAt: createdDate,
      postedDate,
      status: statusDisplay,
      statusEnum: part.status,
      // Keep for API calls
      floor: part.floor || 1,
      apartment_id: part.apartment_id,
      // Admin contact info will be populated by fetchAllStudios
      adminPhone: null,
      contact_number: null
      // Will be set to admin phone or fallback
    };
  };
  const fetchAllStudios = async () => {
    try {
      setIsLoading(true);
      setError2(null);
      const response = await apartmentPartsApi.getAll();
      const parts = Array.isArray(response) ? response : (response == null ? void 0 : response.data) || (response == null ? void 0 : response.parts) || [];
      if (parts && Array.isArray(parts) && parts.length > 0) {
        const availableStudios = parts.filter(
          (part) => !part.status || part.status === "available"
        );
        const transformedStudios = await Promise.all(
          availableStudios.map(async (part) => {
            const transformedStudio = transformApartmentPartToStudio(part);
            if (part.apartment_id) {
              try {
                const apartmentData = await rentApartmentsApi.getById(part.apartment_id);
                const isMasterAdmin = apartmentData.listed_by_admin_id === 1;
                const masterAdminPhone = "+201029936060";
                transformedStudio.adminPhone = isMasterAdmin ? masterAdminPhone : apartmentData.contact_number || "+201000000000";
                transformedStudio.contact_number = isMasterAdmin ? masterAdminPhone : apartmentData.contact_number || "+201000000000";
              } catch (error2) {
                transformedStudio.contact_number = "+201000000000";
                transformedStudio.adminPhone = "+201000000000";
              }
            } else {
              transformedStudio.contact_number = "+201000000000";
              transformedStudio.adminPhone = "+201000000000";
            }
            return transformedStudio;
          })
        );
        setAllStudios(transformedStudios);
        const firstBatch = transformedStudios.slice(0, STUDIOS_PER_PAGE);
        setDisplayedStudios(firstBatch);
        setCurrentPage(2);
        setHasMore(transformedStudios.length > STUDIOS_PER_PAGE);
      } else {
        setAllStudios([]);
        setDisplayedStudios([]);
        setHasMore(false);
      }
    } catch (error2) {
      const errorMessage = handleApiError(error2, "Failed to load studios");
      setError2(errorMessage);
      setAllStudios([]);
      setDisplayedStudios([]);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchAllStudios();
  }, []);
  const filteredStudios = React.useMemo(() => {
    if (!allStudios.length) return [];
    return allStudios.filter((studio) => {
      var _a;
      if (priceRange !== "all") {
        const price = studio.pricePerMonth;
        if (priceRange === "low" && price >= 3e3) return false;
        if (priceRange === "high" && price < 3e3) return false;
      }
      if (locationFilter !== "all") {
        const studioLocationEnum = studio.locationEnum || ((_a = studio.location) == null ? void 0 : _a.toLowerCase());
        if (!studioLocationEnum || studioLocationEnum !== locationFilter) return false;
      }
      return true;
    });
  }, [allStudios, priceRange, locationFilter]);
  const sortedStudios = React.useMemo(() => {
    if (!filteredStudios.length) return [];
    return [...filteredStudios].sort((a, b) => {
      if (sortBy === "price-low") return a.pricePerMonth - b.pricePerMonth;
      if (sortBy === "price-high") return b.pricePerMonth - a.pricePerMonth;
      if (sortBy === "newest") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return 0;
    });
  }, [filteredStudios, sortBy]);
  const loadMoreStudios = () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      const startIndex = (currentPage - 1) * STUDIOS_PER_PAGE;
      const endIndex = startIndex + STUDIOS_PER_PAGE;
      const newStudios = sortedStudios.slice(startIndex, endIndex);
      if (newStudios.length === 0) {
        setHasMore(false);
      } else {
        setDisplayedStudios((prev) => {
          const existingIds = new Set(prev.map((s) => s.id));
          const uniqueNewStudios = newStudios.filter((s) => !existingIds.has(s.id));
          return [...prev, ...uniqueNewStudios];
        });
        setCurrentPage((prev) => prev + 1);
      }
      setIsLoadingMore(false);
    }, 500);
  };
  useEffect(() => {
    if (sortedStudios.length === 0) {
      setDisplayedStudios([]);
      setCurrentPage(1);
      setHasMore(false);
      return;
    }
    const firstBatch = sortedStudios.slice(0, STUDIOS_PER_PAGE);
    setDisplayedStudios(firstBatch);
    setCurrentPage(2);
    setHasMore(sortedStudios.length > STUDIOS_PER_PAGE);
  }, [sortBy, priceRange, locationFilter, sortedStudios]);
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 1e3) {
        loadMoreStudios();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const handleRetry = () => {
    fetchAllStudios();
  };
  return /* @__PURE__ */ jsxs("div", { className: "studios-list-page", children: [
    /* @__PURE__ */ jsxs("nav", { className: "studios-nav", children: [
      /* @__PURE__ */ jsx(BackButton, { text: "← Back", to: "/" }),
      /* @__PURE__ */ jsxs("div", { className: "brand", children: [
        /* @__PURE__ */ jsx("img", { src: aygLogo, alt: "AYG Logo", className: "brand-logo" }),
        /* @__PURE__ */ jsx("span", { className: "brand-text", children: "AYG" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "studios-container", children: [
      /* @__PURE__ */ jsxs("header", { className: "studios-header", children: [
        /* @__PURE__ */ jsx("h1", { children: "Studios for Rent" }),
        !isLoading && !error && /* @__PURE__ */ jsxs("p", { children: [
          sortedStudios.length,
          " properties found, showing ",
          displayedStudios.length
        ] })
      ] }),
      error && /* @__PURE__ */ jsx("div", { className: "error-state", children: /* @__PURE__ */ jsxs("div", { className: "error-content", children: [
        /* @__PURE__ */ jsx("h3", { children: "Failed to Load Studios" }),
        /* @__PURE__ */ jsx("p", { children: error }),
        /* @__PURE__ */ jsx("button", { className: "retry-btn", onClick: handleRetry, children: "Try Again" })
      ] }) }),
      isLoading && !error && /* @__PURE__ */ jsx("div", { className: "loading-state", children: /* @__PURE__ */ jsx("div", { className: "loading-spinner" }) }),
      !isLoading && !error && /* @__PURE__ */ jsxs("div", { className: "filters-section", children: [
        /* @__PURE__ */ jsxs("div", { className: "filter-group", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "location", children: "Location:" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              id: "location",
              value: locationFilter,
              onChange: (e) => setLocationFilter(e.target.value),
              className: "filter-select",
              children: [
                /* @__PURE__ */ jsx("option", { value: "all", children: "All Locations" }),
                getValidOptions.locations().map((option) => /* @__PURE__ */ jsx("option", { value: option.value, children: option.label }, option.value))
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "filter-group", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "sort", children: "Sort by:" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              id: "sort",
              value: sortBy,
              onChange: (e) => setSortBy(e.target.value),
              className: "filter-select",
              children: [
                /* @__PURE__ */ jsx("option", { value: "newest", children: "Newest" }),
                /* @__PURE__ */ jsx("option", { value: "price-low", children: "Price: Low to High" }),
                /* @__PURE__ */ jsx("option", { value: "price-high", children: "Price: High to Low" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "filter-group", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "price", children: "Price Range:" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              id: "price",
              value: priceRange,
              onChange: (e) => setPriceRange(e.target.value),
              className: "filter-select",
              children: [
                /* @__PURE__ */ jsx("option", { value: "all", children: "All Prices" }),
                /* @__PURE__ */ jsx("option", { value: "low", children: "Under 3,000 EGP" }),
                /* @__PURE__ */ jsx("option", { value: "high", children: "Above 3,000 EGP" })
              ]
            }
          )
        ] })
      ] }),
      !isLoading && !error && /* @__PURE__ */ jsx("div", { className: "studios-grid", children: displayedStudios.map((studio) => /* @__PURE__ */ jsx(StudioCard, { studio }, studio.id)) }),
      !isLoading && !error && isLoadingMore && /* @__PURE__ */ jsx("div", { className: "loading-indicator", children: /* @__PURE__ */ jsx("div", { className: "loading-spinner" }) }),
      !isLoading && !error && !isLoadingMore && hasMore && displayedStudios.length > 0 && /* @__PURE__ */ jsx("div", { className: "load-more-section", children: /* @__PURE__ */ jsx(
        "button",
        {
          className: "load-more-btn",
          onClick: loadMoreStudios,
          children: "Load More Studios"
        }
      ) }),
      !isLoading && !error && !hasMore && displayedStudios.length > 0 && /* @__PURE__ */ jsx("div", { className: "end-indicator", children: /* @__PURE__ */ jsx("p", { children: "You've reached the end! No more studios to show." }) }),
      !isLoading && !error && displayedStudios.length === 0 && allStudios.length === 0 && /* @__PURE__ */ jsxs("div", { className: "no-results", children: [
        /* @__PURE__ */ jsx("h3", { children: "No studios available" }),
        /* @__PURE__ */ jsx("p", { children: "There are currently no studios available for rent. Please check back later." })
      ] }),
      !isLoading && !error && displayedStudios.length === 0 && allStudios.length > 0 && /* @__PURE__ */ jsxs("div", { className: "no-results", children: [
        /* @__PURE__ */ jsx("h3", { children: "No studios found" }),
        /* @__PURE__ */ jsx("p", { children: "Try adjusting your filters to see more options." })
      ] })
    ] }),
    /* @__PURE__ */ jsx(Footer, {})
  ] });
};
const ImageGallery = ({ images, title }) => {
  const validImages = Array.isArray(images) ? images.filter((image) => typeof image === "string" && image.trim().length > 0) : [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [failedImages, setFailedImages] = useState(() => /* @__PURE__ */ new Set());
  const availableImages = validImages.filter((image) => !failedImages.has(image));
  const nextImage = (e) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % availableImages.length);
  };
  const prevImage = (e) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + availableImages.length) % availableImages.length);
  };
  const openModal = (index) => {
    setCurrentIndex(index);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
  };
  const goToSlide = (index) => {
    setCurrentIndex(index);
  };
  useEffect(() => {
    if (availableImages.length <= 1 || isHovered || isModalOpen) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % availableImages.length);
    }, 4e3);
    return () => clearInterval(interval);
  }, [availableImages.length, isHovered, isModalOpen]);
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isModalOpen) return;
      if (e.key === "ArrowRight") {
        setCurrentIndex((prev) => (prev + 1) % availableImages.length);
      } else if (e.key === "ArrowLeft") {
        setCurrentIndex((prev) => (prev - 1 + availableImages.length) % availableImages.length);
      } else if (e.key === "Escape") {
        closeModal();
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isModalOpen, availableImages.length]);
  useEffect(() => {
    if (currentIndex >= availableImages.length) {
      setCurrentIndex(0);
    }
  }, [availableImages.length, currentIndex]);
  const handleImageError = (failedSrc) => {
    setFailedImages((prev) => {
      const next = new Set(prev);
      next.add(failedSrc);
      return next;
    });
  };
  if (availableImages.length === 0) {
    return /* @__PURE__ */ jsx("div", { className: "image-gallery", children: /* @__PURE__ */ jsx("div", { className: "gallery-slider", children: /* @__PURE__ */ jsx("div", { className: "slider-container", children: /* @__PURE__ */ jsx("div", { className: "slider-image", style: { display: "grid", placeItems: "center", color: "#666" }, children: "No Image Available" }) }) }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "image-gallery", children: [
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: "gallery-slider",
        onMouseEnter: () => setIsHovered(true),
        onMouseLeave: () => setIsHovered(false),
        children: [
          /* @__PURE__ */ jsxs("div", { className: "slider-container", children: [
            /* @__PURE__ */ jsx(
              "img",
              {
                src: availableImages[currentIndex],
                alt: `${title} ${currentIndex + 1}`,
                className: "slider-image",
                onError: () => handleImageError(availableImages[currentIndex]),
                onClick: () => openModal(currentIndex)
              }
            ),
            availableImages.length > 1 && /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("button", { className: "slider-nav prev", onClick: prevImage, children: "‹" }),
              /* @__PURE__ */ jsx("button", { className: "slider-nav next", onClick: nextImage, children: "›" })
            ] })
          ] }),
          availableImages.length > 1 && /* @__PURE__ */ jsx("div", { className: "slider-dots", children: availableImages.map((_, index) => /* @__PURE__ */ jsx(
            "button",
            {
              className: `dot ${index === currentIndex ? "active" : ""}`,
              onClick: () => goToSlide(index)
            },
            index
          )) })
        ]
      }
    ),
    isModalOpen && /* @__PURE__ */ jsx("div", { className: "gallery-modal", onClick: closeModal, children: /* @__PURE__ */ jsxs("div", { className: "modal-content", onClick: (e) => e.stopPropagation(), children: [
      /* @__PURE__ */ jsx("button", { className: "close-button", onClick: closeModal, children: "×" }),
      /* @__PURE__ */ jsx("button", { className: "nav-button prev", onClick: prevImage, children: "‹" }),
      /* @__PURE__ */ jsx(
        "img",
        {
          src: availableImages[currentIndex],
          alt: `${title} ${currentIndex + 1}`,
          className: "modal-image",
          onError: () => handleImageError(availableImages[currentIndex])
        }
      ),
      /* @__PURE__ */ jsx("button", { className: "nav-button next", onClick: nextImage, children: "›" }),
      /* @__PURE__ */ jsxs("div", { className: "modal-image-counter", children: [
        currentIndex + 1,
        " / ",
        availableImages.length
      ] })
    ] }) })
  ] });
};
const WhatsAppButton = ({
  phoneNumber,
  message = "Hello, I'm interested in this property",
  label = null,
  contactType = null
  // 'customer' or 'agency'
}) => {
  const handleWhatsAppClick = () => {
    const cleanedPhone = phoneNumber.replace(/[^0-9]/g, "");
    const whatsappUrl = `https://wa.me/${cleanedPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };
  return /* @__PURE__ */ jsxs("div", { className: "whatsapp-button-container", children: [
    label && /* @__PURE__ */ jsx("div", { className: "whatsapp-label", children: label }),
    /* @__PURE__ */ jsxs(
      "button",
      {
        className: `whatsapp-button ${contactType ? `whatsapp-${contactType}` : ""}`,
        onClick: handleWhatsAppClick,
        type: "button",
        title: `Contact via WhatsApp: ${phoneNumber}`,
        children: [
          /* @__PURE__ */ jsx("span", { className: "whatsapp-icon", children: /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faWhatsapp }) }),
          /* @__PURE__ */ jsx("span", { className: "whatsapp-text", children: contactType === "customer" ? "Contact Customer" : "WhatsApp" })
        ]
      }
    )
  ] });
};
const formatPhoneForAPI = (phoneNumber) => {
  if (!phoneNumber) return "";
  const cleaned = phoneNumber.replace(/[\s\-()]/g, "");
  if (cleaned.startsWith("+20")) {
    return cleaned;
  }
  if (cleaned.startsWith("20")) {
    return `+${cleaned}`;
  }
  if (cleaned.startsWith("0") && cleaned.length === 11) {
    return `+2${cleaned}`;
  }
  if (cleaned.startsWith("0")) {
    return `+2${cleaned}`;
  }
  if (cleaned.startsWith("1") && cleaned.length === 10) {
    return `+20${cleaned}`;
  }
  return `+20${cleaned}`;
};
const normalizePhoneInput = (phoneNumber) => {
  if (!phoneNumber) return "";
  const cleaned = phoneNumber.replace(/[\s\-()]/g, "");
  const digitsOnly = cleaned.replace(/[^0-9]/g, "");
  if (cleaned.startsWith("+20")) {
    return cleaned.substring(3);
  }
  if (cleaned.startsWith("20") && !cleaned.startsWith("0")) {
    return cleaned.substring(2);
  }
  return digitsOnly;
};
const validateEgyptianPhone = (phoneNumber) => {
  if (!phoneNumber || !phoneNumber.trim()) {
    return {
      isValid: false,
      error: "Phone number is required"
    };
  }
  const cleaned = phoneNumber.replace(/[\s\-()]/g, "");
  const digitsOnly = cleaned.replace(/^\+/, "").replace(/[^0-9]/g, "");
  if (/^(010|011|012|015)\d{8}$/.test(digitsOnly)) {
    return {
      isValid: true,
      error: null
    };
  }
  if (/^(20)?(10|11|12|15)\d{8}$/.test(digitsOnly)) {
    return {
      isValid: true,
      error: null
    };
  }
  if (/^0[1]?[0-5]?$/.test(digitsOnly) || digitsOnly.length < 11) {
    return {
      isValid: false,
      error: `Please enter 11 digits (currently ${digitsOnly.length}/11)`
    };
  }
  return {
    isValid: false,
    error: "Must be 11 digits starting with 010, 011, 012, or 015 (e.g., 01012345678)"
  };
};
const BookingModal = ({ isOpen, onClose, studio, onBookingSubmit, editMode = false, initialData = null }) => {
  const [formData, setFormData] = useState({
    customerName: (initialData == null ? void 0 : initialData.customer_name) || (initialData == null ? void 0 : initialData.customerName) || "",
    customerPhone: (initialData == null ? void 0 : initialData.customer_phone) || (initialData == null ? void 0 : initialData.customerPhone) || "",
    customerId: (initialData == null ? void 0 : initialData.customer_id_number) || (initialData == null ? void 0 : initialData.customerId) || "",
    contract: null,
    paidDeposit: (initialData == null ? void 0 : initialData.paid_deposit) || (initialData == null ? void 0 : initialData.paidDeposit) || "",
    warranty: (initialData == null ? void 0 : initialData.warrant_amount) || (initialData == null ? void 0 : initialData.warranty) || "",
    rentPeriod: (initialData == null ? void 0 : initialData.rent_period) || (initialData == null ? void 0 : initialData.rentPeriod) || "",
    platformSource: (initialData == null ? void 0 : initialData.how_did_customer_find_us) || (initialData == null ? void 0 : initialData.platformSource) || "",
    startDate: (initialData == null ? void 0 : initialData.rent_start_date) || (initialData == null ? void 0 : initialData.startDate) || "",
    endDate: (initialData == null ? void 0 : initialData.rent_end_date) || (initialData == null ? void 0 : initialData.endDate) || "",
    commission: (initialData == null ? void 0 : initialData.commission) || "0"
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const platformOptions = getValidOptions.customerSources();
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    if (name === "customerPhone") {
      processedValue = normalizePhoneInput(value);
    }
    setFormData((prev) => ({
      ...prev,
      [name]: processedValue
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ""
      }));
    }
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        contract: file
      }));
    }
  };
  const validateForm = () => {
    const newErrors = {};
    if (!formData.customerName.trim()) {
      newErrors.customerName = "Customer name is required";
    }
    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = "Phone number is required";
    } else {
      const phoneValidation = validateEgyptianPhone(formData.customerPhone);
      if (!phoneValidation.isValid) {
        newErrors.customerPhone = phoneValidation.error;
      }
    }
    if (!formData.customerId.trim()) {
      newErrors.customerId = "Customer ID is required";
    }
    if (!formData.paidDeposit.trim()) {
      newErrors.paidDeposit = "Paid deposit is required";
    } else if (isNaN(formData.paidDeposit) || parseFloat(formData.paidDeposit) < 0) {
      newErrors.paidDeposit = "Please enter a valid deposit amount";
    }
    if (!formData.warranty.trim()) {
      newErrors.warranty = "Warranty amount is required";
    } else if (isNaN(formData.warranty) || parseFloat(formData.warranty) < 0) {
      newErrors.warranty = "Please enter a valid warranty amount";
    }
    if (!formData.rentPeriod.trim()) {
      newErrors.rentPeriod = "Rent period is required";
    }
    if (!formData.platformSource) {
      newErrors.platformSource = "Platform source is required";
    }
    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }
    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
    } else if (formData.startDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
      newErrors.endDate = "End date must be after start date";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setIsSubmitting(true);
    try {
      const bookingData = {
        id: editMode ? initialData == null ? void 0 : initialData.id : `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        studioId: studio.id,
        studioTitle: studio.title,
        studioPrice: studio.price,
        customerName: formData.customerName.trim(),
        customerPhone: formatPhoneForAPI(formData.customerPhone.trim()),
        customerId: formData.customerId.trim(),
        contract: formData.contract,
        paidDeposit: parseFloat(formData.paidDeposit),
        warranty: parseFloat(formData.warranty),
        rentPeriod: formData.rentPeriod.trim(),
        commission: parseFloat(formData.commission) || 0,
        how_did_customer_find_us: formData.platformSource,
        // API field name
        startDate: formData.startDate,
        endDate: formData.endDate,
        bookingDate: editMode ? (initialData == null ? void 0 : initialData.created_at) || (initialData == null ? void 0 : initialData.bookingDate) : (/* @__PURE__ */ new Date()).toISOString(),
        totalAmount: parseFloat(formData.paidDeposit) + parseFloat(formData.warranty)
      };
      onBookingSubmit(bookingData, editMode);
      setFormData({
        customerName: "",
        customerPhone: "",
        customerId: "",
        contract: null,
        paidDeposit: "",
        warranty: "",
        rentPeriod: "",
        platformSource: "",
        startDate: "",
        endDate: ""
      });
      onClose();
    } catch (error) {
      setErrors({ general: "An error occurred while submitting the booking. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };
  if (!isOpen) return null;
  return /* @__PURE__ */ jsx("div", { className: "modal-overlay", onClick: (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, children: /* @__PURE__ */ jsxs("div", { className: "booking-modal", children: [
    /* @__PURE__ */ jsxs("div", { className: "modal-header", children: [
      /* @__PURE__ */ jsxs("h2", { children: [
        editMode ? "✏️ Edit Booking" : "📋 Book Studio",
        ": ",
        studio == null ? void 0 : studio.title
      ] }),
      /* @__PURE__ */ jsx("button", { className: "close-btn", onClick: onClose, children: "×" })
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "booking-form", children: [
      errors.general && /* @__PURE__ */ jsx("div", { className: "error-message general-error", children: errors.general }),
      /* @__PURE__ */ jsxs("div", { className: "form-row", children: [
        /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "customerName", children: "Customer Name *" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              id: "customerName",
              name: "customerName",
              value: formData.customerName,
              onChange: handleInputChange,
              className: errors.customerName ? "error" : "",
              placeholder: "Enter customer full name"
            }
          ),
          errors.customerName && /* @__PURE__ */ jsx("span", { className: "error-text", children: errors.customerName })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "customerPhone", children: "Phone Number (without +2) *" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "tel",
              id: "customerPhone",
              name: "customerPhone",
              value: formData.customerPhone,
              onChange: handleInputChange,
              className: errors.customerPhone ? "error" : "",
              placeholder: "01012345678 (11 digits)",
              maxLength: "11",
              inputMode: "numeric"
            }
          ),
          errors.customerPhone && /* @__PURE__ */ jsx("span", { className: "error-text", children: errors.customerPhone })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "form-row", children: [
        /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "customerId", children: "Customer ID *" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              id: "customerId",
              name: "customerId",
              value: formData.customerId,
              onChange: handleInputChange,
              className: errors.customerId ? "error" : "",
              placeholder: "National ID or Passport number"
            }
          ),
          errors.customerId && /* @__PURE__ */ jsx("span", { className: "error-text", children: errors.customerId })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "platformSource", children: "How did customer find us? *" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              id: "platformSource",
              name: "platformSource",
              value: formData.platformSource,
              onChange: handleInputChange,
              className: errors.platformSource ? "error" : "",
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "Select platform" }),
                platformOptions.map((platform) => /* @__PURE__ */ jsx("option", { value: platform.value, children: platform.label }, platform.value))
              ]
            }
          ),
          errors.platformSource && /* @__PURE__ */ jsx("span", { className: "error-text", children: errors.platformSource })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "form-row", children: [
        /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "paidDeposit", children: "Paid Deposit (EGP) *" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              id: "paidDeposit",
              name: "paidDeposit",
              value: formData.paidDeposit,
              onChange: handleInputChange,
              className: errors.paidDeposit ? "error" : "",
              placeholder: "5000",
              min: "0",
              step: "0.01"
            }
          ),
          errors.paidDeposit && /* @__PURE__ */ jsx("span", { className: "error-text", children: errors.paidDeposit })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "warranty", children: "Warranty Amount (EGP) *" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              id: "warranty",
              name: "warranty",
              value: formData.warranty,
              onChange: handleInputChange,
              className: errors.warranty ? "error" : "",
              placeholder: "2000",
              min: "0",
              step: "0.01"
            }
          ),
          errors.warranty && /* @__PURE__ */ jsx("span", { className: "error-text", children: errors.warranty })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "form-row", children: [
        /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "startDate", children: "Rent Start Date *" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "date",
              id: "startDate",
              name: "startDate",
              value: formData.startDate,
              onChange: handleInputChange,
              className: errors.startDate ? "error" : "",
              min: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
            }
          ),
          errors.startDate && /* @__PURE__ */ jsx("span", { className: "error-text", children: errors.startDate })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "endDate", children: "Rent End Date *" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "date",
              id: "endDate",
              name: "endDate",
              value: formData.endDate,
              onChange: handleInputChange,
              className: errors.endDate ? "error" : "",
              min: formData.startDate || (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
            }
          ),
          errors.endDate && /* @__PURE__ */ jsx("span", { className: "error-text", children: errors.endDate })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "form-group full-width", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "rentPeriod", children: "Rent Period Description *" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            id: "rentPeriod",
            name: "rentPeriod",
            value: formData.rentPeriod,
            onChange: handleInputChange,
            className: errors.rentPeriod ? "error" : "",
            placeholder: "e.g., 12 months, 6 months, etc."
          }
        ),
        errors.rentPeriod && /* @__PURE__ */ jsx("span", { className: "error-text", children: errors.rentPeriod })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "form-group full-width", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "contract", children: "Upload Contract (PDF, DOC, DOCX)" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "file",
            id: "contract",
            name: "contract",
            onChange: handleFileChange,
            accept: ".pdf,.doc,.docx",
            className: "file-input"
          }
        ),
        formData.contract && /* @__PURE__ */ jsxs("div", { className: "file-info", children: [
          "📄 ",
          formData.contract.name
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "form-actions", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            className: "cancel-btn",
            onClick: onClose,
            disabled: isSubmitting,
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            className: "submit-btn",
            disabled: isSubmitting,
            children: isSubmitting ? "Creating Booking..." : "Create Booking & Generate Bill"
          }
        )
      ] })
    ] })
  ] }) });
};
const EditStudioModal = ({ studio, apartmentId, onStudioUpdated, onClose }) => {
  var _a, _b, _c, _d;
  const [formData, setFormData] = useState({
    title: studio.title || "",
    area: studio.area || "",
    floor: studio.floor || "",
    unitNumber: studio.unitNumber || "",
    price: studio.price || "",
    pricePerMonth: studio.pricePerMonth || 0,
    bedrooms: ((_a = studio.bedrooms) == null ? void 0 : _a.toString()) || "1",
    bathrooms: ((_b = studio.bathrooms) == null ? void 0 : _b.toString()) || "1",
    furnished: studio.furnished || "Yes",
    description: studio.description || "",
    location: studio.location || "",
    balcony: ((_c = studio.details) == null ? void 0 : _c.balcony) || "Yes",
    parking: ((_d = studio.details) == null ? void 0 : _d.parking) || "Available",
    isAvailable: studio.isAvailable
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    setFormData((prev) => ({
      ...prev,
      [name]: newValue
    }));
    if (name === "price") {
      const numericPrice = value.replace(/[^0-9]/g, "");
      setFormData((prev) => ({
        ...prev,
        price: value,
        pricePerMonth: parseInt(numericPrice) || 0
      }));
    }
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ""
      }));
    }
  };
  const validateForm = () => {
    var _a2, _b2, _c2, _d2, _e, _f, _g;
    const newErrors = {};
    if (!((_a2 = formData.title) == null ? void 0 : _a2.toString().trim())) {
      newErrors.title = "Studio title is required";
    }
    if (!((_b2 = formData.area) == null ? void 0 : _b2.toString().trim())) {
      newErrors.area = "Area is required";
    }
    if (!((_c2 = formData.floor) == null ? void 0 : _c2.toString().trim())) {
      newErrors.floor = "Floor is required";
    }
    if (!((_d2 = formData.unitNumber) == null ? void 0 : _d2.toString().trim())) {
      newErrors.unitNumber = "Unit number is required";
    }
    if (!((_e = formData.price) == null ? void 0 : _e.toString().trim())) {
      newErrors.price = "Price is required";
    }
    if (!((_f = formData.description) == null ? void 0 : _f.toString().trim())) {
      newErrors.description = "Description is required";
    }
    if (!((_g = formData.location) == null ? void 0 : _g.toString().trim())) {
      newErrors.location = "Location is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setIsSubmitting(true);
    try {
      const updatedStudio = {
        // Backend required fields with correct types
        title: String(formData.title).trim(),
        area: parseFloat(String(formData.area).replace(/[^0-9.]/g, "")) || 0,
        floor: parseInt(String(formData.floor).replace(/[^0-9]/g, "")) || 1,
        monthly_price: parseFloat(String(formData.price).replace(/[^0-9.]/g, "")) || 0,
        bedrooms: parseInt(formData.bedrooms) || 1,
        // Backend enum values (lowercase)
        bathrooms: formData.bathrooms === "1" ? "private" : "shared",
        furnished: formData.furnished === "Yes" ? "yes" : "no",
        balcony: formData.balcony === "Yes" ? "yes" : formData.balcony === "Shared" ? "shared" : "no",
        // Optional fields
        description: String(formData.description || "").trim(),
        status: formData.isAvailable ? "available" : "rented",
        photos_url: studio.photos_url || []
      };
      onStudioUpdated(updatedStudio);
    } catch (error) {
      setErrors({ general: "An error occurred while updating the studio. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "modal-overlay", onClick: onClose, children: /* @__PURE__ */ jsxs("div", { className: "edit-studio-modal", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxs("div", { className: "modal-header", children: [
      /* @__PURE__ */ jsx("h2", { children: "Edit Studio" }),
      /* @__PURE__ */ jsx("button", { className: "close-btn", onClick: onClose, children: "×" })
    ] }),
    /* @__PURE__ */ jsxs("form", { className: "studio-form", onSubmit: handleSubmit, children: [
      errors.general && /* @__PURE__ */ jsx("div", { className: "error-message general-error", children: errors.general }),
      /* @__PURE__ */ jsxs("div", { className: "form-row", children: [
        /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "title", children: "Studio Title *" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              id: "title",
              name: "title",
              value: formData.title,
              onChange: handleInputChange,
              className: errors.title ? "error" : "",
              placeholder: "e.g., Premium Studio - Unit A"
            }
          ),
          errors.title && /* @__PURE__ */ jsx("span", { className: "error-text", children: errors.title })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "unitNumber", children: "Unit Number *" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              id: "unitNumber",
              name: "unitNumber",
              value: formData.unitNumber,
              onChange: handleInputChange,
              className: errors.unitNumber ? "error" : "",
              placeholder: "e.g., A-301"
            }
          ),
          errors.unitNumber && /* @__PURE__ */ jsx("span", { className: "error-text", children: errors.unitNumber })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "form-row", children: [
        /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "area", children: "Area *" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              id: "area",
              name: "area",
              value: formData.area,
              onChange: handleInputChange,
              className: errors.area ? "error" : "",
              placeholder: "e.g., 50 sqm"
            }
          ),
          errors.area && /* @__PURE__ */ jsx("span", { className: "error-text", children: errors.area })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "floor", children: "Floor *" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              id: "floor",
              name: "floor",
              value: formData.floor,
              onChange: handleInputChange,
              className: errors.floor ? "error" : "",
              placeholder: "e.g., 3rd Floor"
            }
          ),
          errors.floor && /* @__PURE__ */ jsx("span", { className: "error-text", children: errors.floor })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "form-row", children: [
        /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "price", children: "Monthly Price (EGP) *" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              id: "price",
              name: "price",
              value: formData.price,
              onChange: handleInputChange,
              className: errors.price ? "error" : "",
              placeholder: "e.g., 15,000"
            }
          ),
          errors.price && /* @__PURE__ */ jsx("span", { className: "error-text", children: errors.price })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "bedrooms", children: "Bedrooms" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              id: "bedrooms",
              name: "bedrooms",
              value: formData.bedrooms,
              onChange: handleInputChange,
              children: [
                /* @__PURE__ */ jsx("option", { value: "1", children: "1" }),
                /* @__PURE__ */ jsx("option", { value: "2", children: "2" })
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "form-row", children: [
        /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "bathrooms", children: "Bathrooms" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              id: "bathrooms",
              name: "bathrooms",
              value: formData.bathrooms,
              onChange: handleInputChange,
              children: [
                /* @__PURE__ */ jsx("option", { value: "1", children: "1" }),
                /* @__PURE__ */ jsx("option", { value: "2", children: "2" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "furnished", children: "Furnished" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              id: "furnished",
              name: "furnished",
              value: formData.furnished,
              onChange: handleInputChange,
              children: [
                /* @__PURE__ */ jsx("option", { value: "Yes", children: "Yes" }),
                /* @__PURE__ */ jsx("option", { value: "No", children: "No" }),
                /* @__PURE__ */ jsx("option", { value: "Semi-furnished", children: "Semi-furnished" })
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "form-row", children: [
        /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "balcony", children: "Balcony" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              id: "balcony",
              name: "balcony",
              value: formData.balcony,
              onChange: handleInputChange,
              children: [
                /* @__PURE__ */ jsx("option", { value: "Yes", children: "Yes" }),
                /* @__PURE__ */ jsx("option", { value: "No", children: "No" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "parking", children: "Parking" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              id: "parking",
              name: "parking",
              value: formData.parking,
              onChange: handleInputChange,
              children: [
                /* @__PURE__ */ jsx("option", { value: "Available", children: "Available" }),
                /* @__PURE__ */ jsx("option", { value: "Valet", children: "Valet" }),
                /* @__PURE__ */ jsx("option", { value: "Not Available", children: "Not Available" })
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "form-group full-width", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "location", children: "Location *" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            id: "location",
            name: "location",
            value: formData.location,
            onChange: handleInputChange,
            className: errors.location ? "error" : "",
            placeholder: "e.g., New Cairo, Cairo Governorate"
          }
        ),
        errors.location && /* @__PURE__ */ jsx("span", { className: "error-text", children: errors.location })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "form-group full-width", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "description", children: "Description *" }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            id: "description",
            name: "description",
            value: formData.description,
            onChange: handleInputChange,
            className: errors.description ? "error" : "",
            placeholder: "Describe the studio features, amenities, and unique selling points...",
            rows: "4"
          }
        ),
        errors.description && /* @__PURE__ */ jsx("span", { className: "error-text", children: errors.description })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "form-group checkbox-group", children: /* @__PURE__ */ jsxs("label", { className: "checkbox-label", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "checkbox",
            name: "isAvailable",
            checked: formData.isAvailable,
            onChange: handleInputChange
          }
        ),
        /* @__PURE__ */ jsx("span", { className: "checkbox-text", children: "Studio is available for rent" })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "modal-actions", children: [
        /* @__PURE__ */ jsx("button", { type: "button", className: "cancel-btn", onClick: onClose, children: "Cancel" }),
        /* @__PURE__ */ jsx("button", { type: "submit", className: "submit-btn", disabled: isSubmitting, children: isSubmitting ? "Updating Studio..." : "Update Studio" })
      ] })
    ] })
  ] }) });
};
const LoadingSpinner = ({
  size = "medium",
  color = "primary",
  message = "",
  inline = false,
  overlay = false,
  className = ""
}) => {
  const sizeClass = `spinner-${size}`;
  const colorClass = `spinner-${color}`;
  const containerClass = inline ? "loading-spinner-inline" : overlay ? "loading-spinner-overlay" : "loading-spinner-container";
  return /* @__PURE__ */ jsxs("div", { className: `${containerClass} ${className} ${overlay ? "overlay-active" : ""}`, children: [
    /* @__PURE__ */ jsx("div", { className: `loading-spinner ${sizeClass} ${colorClass}`, children: /* @__PURE__ */ jsx("div", { className: "spinner" }) }),
    message && /* @__PURE__ */ jsx("p", { className: "loading-message", children: message })
  ] });
};
const StudioDetailsPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [navigationSource, setNavigationSource] = useState("customer-studios");
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [studioBooking, setStudioBooking] = useState(null);
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isDeletingBooking, setIsDeletingBooking] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading2] = useState(true);
  const [error, setError2] = useState(null);
  const [studio, setStudio] = useState(null);
  const [parentApartment, setParentApartment] = useState(null);
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  const isRenderableImageUrl = (url) => {
    if (typeof url !== "string" || !url.trim()) return false;
    if (url.startsWith("blob:")) return false;
    if (url.includes("example.com")) return false;
    return true;
  };
  useEffect(() => {
    const fetchStudioDetails = async () => {
      setLoading2(true);
      setError2(null);
      try {
        const studioResponse = await apartmentPartsApi.getById(id);
        if (studioResponse) {
          const studioData = { ...studioResponse };
          const rawImages = studioData.images || studioData.photos_url || [];
          const safeImages = Array.isArray(rawImages) ? rawImages.filter(isRenderableImageUrl) : [];
          studioData.images = safeImages;
          if (studioData.apartment_id) {
            try {
              const apartmentResponse = await rentApartmentsApi.getById(studioData.apartment_id);
              if (apartmentResponse) {
                setParentApartment(apartmentResponse);
                const isMasterAdmin = apartmentResponse.listed_by_admin_id === 1;
                const masterAdminPhone = "+201029936060";
                studioData.adminPhone = isMasterAdmin ? masterAdminPhone : apartmentResponse.contact_number || "+201000000000";
                studioData.contact_number = isMasterAdmin ? masterAdminPhone : apartmentResponse.contact_number || "+201000000000";
              }
            } catch (apartmentError) {
              studioData.adminPhone = "+201000000000";
              studioData.contact_number = "+201000000000";
            }
          } else {
            studioData.adminPhone = "+201000000000";
            studioData.contact_number = "+201000000000";
          }
          setStudio(studioData);
        } else {
          setError2("Studio not found");
        }
      } catch (err) {
        setError2("Failed to load studio details");
      } finally {
        setLoading2(false);
      }
    };
    if (id) {
      fetchStudioDetails();
    }
  }, [id]);
  useEffect(() => {
    const source = searchParams.get("source");
    if (["master-admin-dashboard", "customer-studios", "admin-dashboard", "admin-tracking", "admin-rental-alerts", "master-admin-rental-alerts"].includes(source)) {
      setNavigationSource(source);
    } else {
      setNavigationSource("customer-studios");
    }
    const fetchExistingBooking = async () => {
      const isAdminView = source === "admin-dashboard" || source === "master-admin-dashboard" || source === "admin-tracking" || source === "admin-rental-alerts" || source === "master-admin-rental-alerts";
      if (!isAdminView) {
        return;
      }
      try {
        if (id) {
          const contractsResponse = await rentalContractsApi.getAll();
          if (contractsResponse && Array.isArray(contractsResponse)) {
            const existingContract = contractsResponse.find((contract) => {
              const matches = contract.apartment_part_id === parseInt(id) || contract.studioId === parseInt(id);
              const isActive = contract.is_active === true || contract.isActive === true;
              return matches && isActive;
            });
            if (existingContract) {
              setStudioBooking(existingContract);
            } else {
              setStudioBooking(null);
            }
          }
        }
      } catch (error2) {
      }
    };
    fetchExistingBooking();
  }, [id, searchParams]);
  const handleBookingSubmit = async (bookingData) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l;
    setIsBookingLoading(true);
    try {
      if (studioBooking) {
        showWarning("This studio already has an active booking. Delete it before creating a new one.");
        setIsBookingLoading(false);
        setIsBookingModalOpen(false);
        return;
      }
      try {
        const allContracts = await rentalContractsApi.getAll();
        const existingContract = allContracts == null ? void 0 : allContracts.find(
          (contract) => contract.apartment_part_id === parseInt(id) || contract.studioId === parseInt(id)
        );
        if (existingContract) {
          showWarning(
            `Booking already exists for ${existingContract.customer_name || existingContract.customerName} (Contract #${existingContract.id}).`
          );
          setStudioBooking(existingContract);
          setIsBookingLoading(false);
          setIsBookingModalOpen(false);
          return;
        }
      } catch (checkError) {
      }
      if (studio.status !== "available" && studio.statusEnum !== "available") {
        showWarning("This studio is not available for booking. Status: " + (studio.status || studio.statusEnum || "Unknown"));
        setIsBookingLoading(false);
        setIsBookingModalOpen(false);
        return;
      }
      const rentPeriodValue = typeof bookingData.rentPeriod === "string" ? parseInt(((_a = bookingData.rentPeriod.match(/\d+/)) == null ? void 0 : _a[0]) || "12") : parseInt(bookingData.rentPeriod) || 12;
      const contractData = {
        apartment_part_id: parseInt(id),
        customer_name: bookingData.customerName.trim(),
        customer_phone: bookingData.customerPhone,
        // Already formatted by BookingModal
        customer_id_number: bookingData.customerId.trim(),
        how_did_customer_find_us: bookingData.how_did_customer_find_us || "other",
        paid_deposit: parseFloat(bookingData.paidDeposit) || 0,
        warrant_amount: parseFloat(bookingData.warranty) || 0,
        rent_start_date: bookingData.startDate,
        rent_end_date: bookingData.endDate,
        rent_period: rentPeriodValue,
        // Must be integer
        contract_url: (typeof bookingData.contract === "string" ? bookingData.contract : "") || "",
        customer_id_url: "",
        commission: parseFloat(bookingData.commission) || 0,
        rent_price: parseFloat(studio.monthly_price) || parseFloat(studio.price) || 0
      };
      const response = await rentalContractsApi.create(contractData);
      if (response) {
        showSuccess("Booking created successfully!");
        setStudioBooking(response);
        setIsBookingModalOpen(false);
        const updatedStudioResponse = await apartmentPartsApi.getById(id);
        if (updatedStudioResponse) {
          setStudio(updatedStudioResponse);
        }
        window.location.reload();
      } else {
        showError("Failed to create booking. Please try again.");
      }
    } catch (error2) {
      if (((_b = error2.message) == null ? void 0 : _b.includes("unique constraint")) || ((_c = error2.message) == null ? void 0 : _c.includes("UNIQUE constraint failed")) || ((_d = error2.message) == null ? void 0 : _d.includes("duplicate key"))) {
        showWarning("Booking already exists. Delete the existing booking first.");
      } else if (((_e = error2.message) == null ? void 0 : _e.includes("422")) || ((_f = error2.message) == null ? void 0 : _f.includes("Validation"))) {
        showError("Validation error. Check phone format, numeric amounts, valid dates, platform source, and rent period.");
      } else if ((_g = error2.message) == null ? void 0 : _g.includes("401")) {
        showError("Session expired. Please log in again.");
        localStorage.removeItem("api_access_token");
        navigate("/admin/login");
      } else if ((_h = error2.message) == null ? void 0 : _h.includes("403")) {
        showError("Permission denied. Only the admin who created this apartment can create bookings for it.");
      } else if (((_i = error2.message) == null ? void 0 : _i.includes("500")) || ((_j = error2.message) == null ? void 0 : _j.includes("Internal Server Error"))) {
        showError("Server error. Refresh the page and try again. Contact admin if the issue persists.");
      } else if (((_k = error2.message) == null ? void 0 : _k.includes("Network error")) || ((_l = error2.message) == null ? void 0 : _l.includes("ERR_FAILED"))) {
        showError("Cannot connect to backend. Ensure the server is running and accessible.");
      } else {
        showError(`Failed to create booking: ${error2.message || "Unknown error"}`);
      }
    } finally {
      setIsBookingLoading(false);
    }
  };
  const handleStudioUpdate = async (updatedStudioData) => {
    setIsEditLoading(true);
    try {
      const response = await apartmentPartsApi.update(id, updatedStudioData);
      if (response) {
        setStudio(response);
        setIsEditModalOpen(false);
      } else {
      }
    } catch (error2) {
    } finally {
      setIsEditLoading(false);
    }
  };
  const handleDeleteBooking = () => {
    setShowDeleteConfirm(true);
  };
  const handleConfirmDelete = async () => {
    var _a, _b, _c, _d, _e;
    setShowDeleteConfirm(false);
    setIsDeletingBooking(true);
    try {
      if (studioBooking && studioBooking.id) {
        const response = await rentalContractsApi.delete(studioBooking.id);
        if (response !== false) {
          showSuccess("Booking deleted successfully!");
          setStudioBooking(null);
          const updatedStudioResponse = await apartmentPartsApi.getById(id);
          if (updatedStudioResponse) {
            setStudio(updatedStudioResponse);
          }
          window.location.reload();
        } else {
          showError("Failed to delete booking. Please try again.");
        }
      }
    } catch (error2) {
      if (error2.status === 403 || ((_a = error2.message) == null ? void 0 : _a.includes("403")) || ((_b = error2.message) == null ? void 0 : _b.includes("forbidden")) || ((_c = error2.message) == null ? void 0 : _c.includes("Access forbidden"))) {
        showError("Permission denied. Only Master Admins can delete rental bookings.");
      } else if (error2.status === 404 || ((_d = error2.message) == null ? void 0 : _d.includes("404"))) {
        showWarning("Booking not found. The page will refresh to show the latest status.");
        window.location.reload();
      } else if (error2.status === 401 || ((_e = error2.message) == null ? void 0 : _e.includes("401"))) {
        showError("Session expired. Please log in again.");
        localStorage.removeItem("api_access_token");
        navigate("/admin/login");
      } else {
        showError(`Failed to delete booking: ${error2.message || "Unknown error"}`);
      }
    } finally {
      setIsDeletingBooking(false);
    }
  };
  const getBackLink = () => {
    if (navigationSource === "master-admin-dashboard") {
      return "/master-admin/dashboard";
    } else if (navigationSource === "admin-dashboard") {
      return "/admin/dashboard";
    } else if (navigationSource === "admin-tracking") {
      return "/admin/tracking";
    } else if (navigationSource === "admin-rental-alerts") {
      return "/admin/rental-alerts";
    } else if (navigationSource === "master-admin-rental-alerts") {
      return "/master-admin/rental-alerts";
    } else if (navigationSource === "customer-studios") {
      return "/studios";
    }
    return "/studios";
  };
  const getBackText = () => {
    if (navigationSource === "master-admin-dashboard") {
      return "← Back to Master Admin Dashboard";
    } else if (navigationSource === "admin-dashboard") {
      return "← Back to Admin Dashboard";
    } else if (navigationSource === "admin-tracking") {
      return "← Back to Admin Tracking";
    } else if (navigationSource === "admin-rental-alerts") {
      return "← Back to Admin Rental Alerts";
    } else if (navigationSource === "master-admin-rental-alerts") {
      return "← Back to Master Admin Rental Alerts";
    } else if (navigationSource === "customer-studios") {
      return "← Back to Studios";
    }
    return "← Back to Studios";
  };
  const openGoogleMaps = () => {
    if ((parentApartment == null ? void 0 : parentApartment.location_coordinates) && parentApartment.location_coordinates.lat && parentApartment.location_coordinates.lng) {
      const mapsUrl = `https://www.google.com/maps?q=${parentApartment.location_coordinates.lat},${parentApartment.location_coordinates.lng}`;
      window.open(mapsUrl, "_blank", "noopener,noreferrer");
    } else if ((studio == null ? void 0 : studio.location_coordinates) && studio.location_coordinates.lat && studio.location_coordinates.lng) {
      const mapsUrl = `https://www.google.com/maps?q=${studio.location_coordinates.lat},${studio.location_coordinates.lng}`;
      window.open(mapsUrl, "_blank", "noopener,noreferrer");
    } else if ((parentApartment == null ? void 0 : parentApartment.location) || (studio == null ? void 0 : studio.location)) {
      const searchQuery = encodeURIComponent((parentApartment == null ? void 0 : parentApartment.location) || (studio == null ? void 0 : studio.location));
      const mapsUrl = `https://www.google.com/maps/search/${searchQuery}`;
      window.open(mapsUrl, "_blank", "noopener,noreferrer");
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "studio-details-page", children: /* @__PURE__ */ jsx("div", { className: "container", children: /* @__PURE__ */ jsx("div", { className: "loading-container", children: /* @__PURE__ */ jsx(LoadingSpinner, { size: "large" }) }) }) });
  }
  if (error) {
    return /* @__PURE__ */ jsx("div", { className: "studio-details-page", children: /* @__PURE__ */ jsx("div", { className: "container", children: /* @__PURE__ */ jsxs("div", { className: "error-container", children: [
      /* @__PURE__ */ jsx("h1", { children: "Error Loading Studio" }),
      /* @__PURE__ */ jsx("p", { className: "error-message", children: error }),
      /* @__PURE__ */ jsx(BackButton, { onClick: () => navigate(-1) })
    ] }) }) });
  }
  if (!studio) {
    return /* @__PURE__ */ jsx("div", { className: "studio-details-page", children: /* @__PURE__ */ jsxs("div", { className: "container", children: [
      /* @__PURE__ */ jsx("h1", { children: "Studio not found" }),
      /* @__PURE__ */ jsx(BackButton, { onClick: () => navigate(-1) })
    ] }) });
  }
  const studioNumericPrice = Number(
    studio.monthly_price ?? studio.monthly_rent ?? studio.rent_value ?? studio.price ?? 0
  );
  const studioDisplayPrice = studioNumericPrice > 0 ? `EGP ${studioNumericPrice.toLocaleString()}/month` : "Price on request";
  if (!studio.is_available && navigationSource === "customer") {
    return /* @__PURE__ */ jsx(Navigate, { to: "/studios", replace: true });
  }
  return /* @__PURE__ */ jsxs("div", { className: "studio-details-page", children: [
    /* @__PURE__ */ jsxs("nav", { className: "studio-nav", children: [
      /* @__PURE__ */ jsx(
        BackButton,
        {
          text: getBackText(),
          onClick: () => navigate(getBackLink())
        }
      ),
      /* @__PURE__ */ jsxs(
        Link,
        {
          to: navigationSource === "master-admin" ? "/master-admin/dashboard" : "/",
          className: "brand",
          children: [
            /* @__PURE__ */ jsx("img", { src: aygLogo, alt: "AYG Logo", className: "brand-logo" }),
            /* @__PURE__ */ jsx("span", { className: "brand-text", children: "AYG" })
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "studio-container", children: [
      /* @__PURE__ */ jsx("div", { className: "studio-gallery-section", children: /* @__PURE__ */ jsx(ImageGallery, { images: studio.images || [], title: studio.title || studio.name }) }),
      /* @__PURE__ */ jsxs("div", { className: "studio-content", children: [
        /* @__PURE__ */ jsxs("div", { className: "studio-main-info", children: [
          /* @__PURE__ */ jsxs("div", { className: "studio-header", children: [
            /* @__PURE__ */ jsx("h1", { className: "studio-title", children: studio.title || studio.name }),
            /* @__PURE__ */ jsx("div", { className: "studio-price", children: studioDisplayPrice })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "studio-posted", children: [
            "Posted ",
            studio.created_at ? new Date(studio.created_at).toLocaleDateString() : "Recently"
          ] }),
          ((parentApartment == null ? void 0 : parentApartment.location) || (studio == null ? void 0 : studio.location) || (parentApartment == null ? void 0 : parentApartment.location_coordinates) || (studio == null ? void 0 : studio.location_coordinates)) && /* @__PURE__ */ jsxs("div", { className: "studio-location-section", children: [
            /* @__PURE__ */ jsxs("h3", { children: [
              /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faMapMarkerAlt }),
              " Location"
            ] }),
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: openGoogleMaps,
                className: "maps-button",
                type: "button",
                children: [
                  /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faMap }),
                  " View on Google Maps"
                ]
              }
            ),
            parentApartment && /* @__PURE__ */ jsxs("small", { className: "location-note", children: [
              "Location shared from ",
              parentApartment.name || parentApartment.title
            ] })
          ] }),
          navigationSource === "master-admin-dashboard" && studio.created_by && /* @__PURE__ */ jsxs("div", { className: "creator-info-section", children: [
            /* @__PURE__ */ jsxs("div", { className: "creator-info", children: [
              /* @__PURE__ */ jsx("span", { className: "creator-label", children: "👤 Created by Admin:" }),
              /* @__PURE__ */ jsx("span", { className: "creator-value", children: studio.created_by })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "creator-date", children: [
              /* @__PURE__ */ jsx("span", { className: "creator-label", children: "📅 Created on:" }),
              /* @__PURE__ */ jsx("span", { className: "creator-value", children: studio.created_at ? new Date(studio.created_at).toLocaleDateString() : "N/A" })
            ] })
          ] }),
          (navigationSource === "admin-dashboard" || navigationSource === "master-admin-dashboard" || navigationSource === "admin-tracking" || navigationSource === "admin-rental-alerts" || navigationSource === "master-admin-rental-alerts") && /* @__PURE__ */ jsx("div", { className: "admin-booking-section", children: /* @__PURE__ */ jsxs("div", { className: "admin-buttons", children: [
            !studioBooking ? /* @__PURE__ */ jsx(
              "button",
              {
                className: "book-studio-btn",
                onClick: () => setIsBookingModalOpen(true),
                disabled: isBookingLoading,
                children: isBookingLoading ? /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(LoadingSpinner, { size: "small", color: "white", inline: true }),
                  "Processing..."
                ] }) : "📋 Book This Studio"
              }
            ) : /* @__PURE__ */ jsx(
              "button",
              {
                className: "book-studio-btn booked",
                disabled: true,
                style: { background: "#059669", cursor: "not-allowed" },
                children: "✅ Studio Already Booked"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                className: "edit-studio-btn",
                onClick: () => setIsEditModalOpen(true),
                disabled: isEditLoading,
                children: isEditLoading ? /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx(LoadingSpinner, { size: "small", color: "white", inline: true }) }) : "✏️ Edit Studio"
              }
            )
          ] }) }),
          /* @__PURE__ */ jsxs("div", { className: "highlights-section", children: [
            /* @__PURE__ */ jsx("h2", { children: "Highlights" }),
            /* @__PURE__ */ jsxs("div", { className: "highlights-grid", children: [
              /* @__PURE__ */ jsxs("div", { className: "highlight-item", children: [
                /* @__PURE__ */ jsx("div", { className: "highlight-icon", children: /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faHome }) }),
                /* @__PURE__ */ jsxs("div", { className: "highlight-content", children: [
                  /* @__PURE__ */ jsx("div", { className: "highlight-label", children: "Type" }),
                  /* @__PURE__ */ jsx("div", { className: "highlight-value", children: studio.type || "Studio" })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "highlight-item", children: [
                /* @__PURE__ */ jsx("div", { className: "highlight-icon", children: /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faKey }) }),
                /* @__PURE__ */ jsxs("div", { className: "highlight-content", children: [
                  /* @__PURE__ */ jsx("div", { className: "highlight-label", children: "Ownership" }),
                  /* @__PURE__ */ jsx("div", { className: "highlight-value", children: studio.ownership_type || "Rental" })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "highlight-item", children: [
                /* @__PURE__ */ jsx("div", { className: "highlight-icon", children: /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faRuler }) }),
                /* @__PURE__ */ jsxs("div", { className: "highlight-content", children: [
                  /* @__PURE__ */ jsx("div", { className: "highlight-label", children: "Area (m²)" }),
                  /* @__PURE__ */ jsx("div", { className: "highlight-value", children: studio.area || "N/A" })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "highlight-item", children: [
                /* @__PURE__ */ jsx("div", { className: "highlight-icon", children: /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faBed }) }),
                /* @__PURE__ */ jsxs("div", { className: "highlight-content", children: [
                  /* @__PURE__ */ jsx("div", { className: "highlight-label", children: "Bedrooms" }),
                  /* @__PURE__ */ jsx("div", { className: "highlight-value", children: studio.bedrooms || studio.number_of_bedrooms || "1" })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "highlight-item", children: [
                /* @__PURE__ */ jsx("div", { className: "highlight-icon", children: /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faShower }) }),
                /* @__PURE__ */ jsxs("div", { className: "highlight-content", children: [
                  /* @__PURE__ */ jsx("div", { className: "highlight-label", children: "Bathrooms" }),
                  /* @__PURE__ */ jsx("div", { className: "highlight-value", children: studio.bathrooms || studio.number_of_bathrooms || "1" })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "highlight-item", children: [
                /* @__PURE__ */ jsx("div", { className: "highlight-icon", children: /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faCouch }) }),
                /* @__PURE__ */ jsxs("div", { className: "highlight-content", children: [
                  /* @__PURE__ */ jsx("div", { className: "highlight-label", children: "Furnished" }),
                  /* @__PURE__ */ jsx("div", { className: "highlight-value", children: studio.is_furnished ? "Yes" : "No" })
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "details-section", children: [
            /* @__PURE__ */ jsx("h2", { children: "Details" }),
            /* @__PURE__ */ jsxs("div", { className: "details-table", children: [
              /* @__PURE__ */ jsxs("div", { className: "detail-row", children: [
                /* @__PURE__ */ jsx("span", { className: "detail-label", children: "Payment Option" }),
                /* @__PURE__ */ jsx("span", { className: "detail-value", children: studio.payment_options || "Monthly" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "detail-row", children: [
                /* @__PURE__ */ jsx("span", { className: "detail-label", children: "Completion Status" }),
                /* @__PURE__ */ jsx("span", { className: "detail-value", children: studio.completion_status || "Ready" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "detail-row", children: [
                /* @__PURE__ */ jsx("span", { className: "detail-label", children: "Furnished" }),
                /* @__PURE__ */ jsx("span", { className: "detail-value", children: studio.is_furnished ? "Yes" : "No" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "detail-row", children: [
                /* @__PURE__ */ jsx("span", { className: "detail-label", children: "Parking" }),
                /* @__PURE__ */ jsx("span", { className: "detail-value", children: studio.parking_available ? "Available" : "Not Available" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "description-section", children: [
            /* @__PURE__ */ jsx("h2", { children: "Description" }),
            /* @__PURE__ */ jsx("p", { className: "description-text", children: studio.description || "No description available" })
          ] }),
          studioBooking && (navigationSource === "admin-dashboard" || navigationSource === "master-admin-dashboard" || navigationSource === "admin-tracking" || navigationSource === "admin-rental-alerts" || navigationSource === "master-admin-rental-alerts") && /* @__PURE__ */ jsxs("div", { className: "booking-display-section", children: [
            /* @__PURE__ */ jsxs("h2", { children: [
              /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faClipboardList }),
              " Booking Information"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "booking-card", children: [
              /* @__PURE__ */ jsxs("div", { className: "booking-header", children: [
                /* @__PURE__ */ jsx("h3", { children: "Customer Details" }),
                /* @__PURE__ */ jsxs("div", { className: "booking-actions", children: [
                  /* @__PURE__ */ jsxs("div", { className: "booking-status", children: [
                    /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faCheck }),
                    " Booked"
                  ] }),
                  showDeleteConfirm ? /* @__PURE__ */ jsxs("div", { className: "delete-confirm-inline", children: [
                    /* @__PURE__ */ jsx("span", { children: "Are you sure?" }),
                    /* @__PURE__ */ jsx("button", { className: "confirm-yes-btn", onClick: handleConfirmDelete, disabled: isDeletingBooking, children: "Yes, Delete" }),
                    /* @__PURE__ */ jsx("button", { className: "confirm-no-btn", onClick: () => setShowDeleteConfirm(false), children: "Cancel" })
                  ] }) : /* @__PURE__ */ jsx(
                    "button",
                    {
                      className: "delete-booking-btn",
                      onClick: handleDeleteBooking,
                      disabled: isDeletingBooking,
                      title: "Delete booking",
                      children: isDeletingBooking ? /* @__PURE__ */ jsxs(Fragment, { children: [
                        /* @__PURE__ */ jsx(LoadingSpinner, { size: "small", color: "white", inline: true }),
                        "Deleting..."
                      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                        /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faTrash }),
                        " Cancel Booking"
                      ] })
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "booking-details", children: [
                /* @__PURE__ */ jsxs("div", { className: "detail-grid", children: [
                  /* @__PURE__ */ jsxs("div", { className: "detail-item", children: [
                    /* @__PURE__ */ jsx("span", { className: "detail-label", children: "Customer Name:" }),
                    /* @__PURE__ */ jsx("span", { className: "detail-value", children: studioBooking.customer_name })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "detail-item", children: [
                    /* @__PURE__ */ jsx("span", { className: "detail-label", children: "Phone:" }),
                    /* @__PURE__ */ jsx("span", { className: "detail-value", children: studioBooking.customer_phone })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "detail-item", children: [
                    /* @__PURE__ */ jsx("span", { className: "detail-label", children: "Email:" }),
                    /* @__PURE__ */ jsx("span", { className: "detail-value", children: "N/A" })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "detail-item", children: [
                    /* @__PURE__ */ jsx("span", { className: "detail-label", children: "Customer ID:" }),
                    /* @__PURE__ */ jsx("span", { className: "detail-value", children: studioBooking.customer_id_number })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "detail-item", children: [
                    /* @__PURE__ */ jsx("span", { className: "detail-label", children: "Platform Source:" }),
                    /* @__PURE__ */ jsx("span", { className: "detail-value", children: studioBooking.how_did_customer_find_us })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "detail-item", children: [
                    /* @__PURE__ */ jsx("span", { className: "detail-label", children: "Rent Period:" }),
                    /* @__PURE__ */ jsx("span", { className: "detail-value", children: studioBooking.rent_period })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "detail-item", children: [
                    /* @__PURE__ */ jsx("span", { className: "detail-label", children: "Start Date:" }),
                    /* @__PURE__ */ jsx("span", { className: "detail-value", children: studioBooking.rent_start_date ? new Date(studioBooking.rent_start_date).toLocaleDateString() : "Invalid Date" })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "detail-item", children: [
                    /* @__PURE__ */ jsx("span", { className: "detail-label", children: "End Date:" }),
                    /* @__PURE__ */ jsx("span", { className: "detail-value", children: studioBooking.rent_end_date ? new Date(studioBooking.rent_end_date).toLocaleDateString() : "Invalid Date" })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "detail-item", children: [
                    /* @__PURE__ */ jsx("span", { className: "detail-label", children: "Contract Date:" }),
                    /* @__PURE__ */ jsx("span", { className: "detail-value", children: studioBooking.created_at ? new Date(studioBooking.created_at).toLocaleDateString() : "10/9/2025" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "financial-summary", children: [
                  /* @__PURE__ */ jsx("h4", { children: "💰 Financial Summary" }),
                  /* @__PURE__ */ jsxs("div", { className: "financial-grid", children: [
                    /* @__PURE__ */ jsxs("div", { className: "financial-item", children: [
                      /* @__PURE__ */ jsx("span", { className: "financial-label", children: "Monthly Rent:" }),
                      /* @__PURE__ */ jsxs("span", { className: "financial-value", children: [
                        "EGP ",
                        parseFloat(studioBooking.rent_price || 0).toLocaleString()
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "financial-item", children: [
                      /* @__PURE__ */ jsx("span", { className: "financial-label", children: "Deposit:" }),
                      /* @__PURE__ */ jsxs("span", { className: "financial-value", children: [
                        "EGP ",
                        parseFloat(studioBooking.paid_deposit || 0).toLocaleString()
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "financial-item", children: [
                      /* @__PURE__ */ jsx("span", { className: "financial-label", children: "Warranty:" }),
                      /* @__PURE__ */ jsxs("span", { className: "financial-value", children: [
                        "EGP ",
                        parseFloat(studioBooking.warrant_amount || 0).toLocaleString()
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxs("div", { className: "financial-item total", children: [
                      /* @__PURE__ */ jsx("span", { className: "financial-label", children: "Total Initial:" }),
                      /* @__PURE__ */ jsxs("span", { className: "financial-value", children: [
                        "EGP ",
                        (parseFloat(studioBooking.paid_deposit || 0) + parseFloat(studioBooking.warrant_amount || 0)).toLocaleString()
                      ] })
                    ] })
                  ] })
                ] }),
                studioBooking.notes && /* @__PURE__ */ jsxs("div", { className: "contract-info", children: [
                  /* @__PURE__ */ jsx("h4", { children: "� Notes" }),
                  /* @__PURE__ */ jsx("p", { children: studioBooking.notes })
                ] })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "studio-sidebar", children: /* @__PURE__ */ jsxs("div", { className: "contact-card", children: [
          /* @__PURE__ */ jsx("h3", { children: "Listed by agency" }),
          /* @__PURE__ */ jsxs("div", { className: "agency-info", children: [
            /* @__PURE__ */ jsx("div", { className: "agency-name", children: "AYG" }),
            /* @__PURE__ */ jsx("div", { className: "agency-rating", children: "⭐ 4 C" }),
            /* @__PURE__ */ jsx("div", { className: "agency-member", children: "Member since Sept 2024" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "contact-actions", children: (navigationSource === "admin-dashboard" || navigationSource === "master-admin-dashboard" || navigationSource === "admin-tracking" || navigationSource === "admin-rental-alerts" || navigationSource === "master-admin-rental-alerts") && studioBooking ? (
            // Admin viewing rented studio - Show customer contact
            /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsxs("div", { className: "contact-info-header", children: [
                /* @__PURE__ */ jsx("h4", { children: "Customer Contact" }),
                /* @__PURE__ */ jsx("p", { className: "contact-name", children: studioBooking.customer_name || studioBooking.customerName }),
                /* @__PURE__ */ jsx("p", { className: "contact-phone", children: studioBooking.customer_phone || studioBooking.customerPhone })
              ] }),
              /* @__PURE__ */ jsx(
                WhatsAppButton,
                {
                  phoneNumber: studioBooking.customer_phone || studioBooking.customerPhone || "+201000000000",
                  message: `Hello ${studioBooking.customer_name || studioBooking.customerName}, this is regarding your rental at ${studio.title || studio.name}.`,
                  contactType: "customer",
                  label: "Contact Tenant"
                }
              )
            ] })
          ) : (
            // Customer viewing or no booking - Show agency contact
            /* @__PURE__ */ jsx(
              WhatsAppButton,
              {
                phoneNumber: studio.adminPhone || studio.contact_number || "+201000000000",
                message: `Hello, I'm interested in ${studio.title || studio.name} for ${studioDisplayPrice}`,
                contactType: "agency"
              }
            )
          ) })
        ] }) })
      ] })
    ] }),
    (navigationSource === "admin-dashboard" || navigationSource === "master-admin-dashboard" || navigationSource === "admin-tracking" || navigationSource === "admin-rental-alerts" || navigationSource === "master-admin-rental-alerts") && /* @__PURE__ */ jsx(
      BookingModal,
      {
        isOpen: isBookingModalOpen,
        onClose: () => setIsBookingModalOpen(false),
        studio,
        onBookingSubmit: handleBookingSubmit,
        isLoading: isBookingLoading
      }
    ),
    isEditModalOpen && (navigationSource === "admin-dashboard" || navigationSource === "master-admin-dashboard" || navigationSource === "admin-tracking" || navigationSource === "admin-rental-alerts" || navigationSource === "master-admin-rental-alerts") && /* @__PURE__ */ jsx(
      EditStudioModal,
      {
        onClose: () => setIsEditModalOpen(false),
        studio,
        apartmentId: studio == null ? void 0 : studio.apartment_id,
        onStudioUpdated: handleStudioUpdate,
        isLoading: isEditLoading
      }
    ),
    navigationSource === "customer-studios" && /* @__PURE__ */ jsx(Footer, {})
  ] });
};
const ApartmentSaleCard = ({ apartment }) => {
  const navigate = useNavigate();
  const handleCardClick = () => {
    navigate(`/apartment-sale/${apartment.id}`);
  };
  const formatPrice = (price) => {
    if (!price) return "Contact for price";
    if (price >= 1e6) {
      return `${(price / 1e6).toFixed(1)}M EGP`;
    }
    return price.toLocaleString("en-EG") + " EGP";
  };
  const getAvailabilityStatus = () => {
    if (apartment.isAvailable === false) return "Sold";
    return "Available";
  };
  const getAvailabilityCount = () => {
    if (apartment.availableUnits && apartment.totalUnits) {
      return `${apartment.availableUnits} Available`;
    }
    return getAvailabilityStatus();
  };
  return /* @__PURE__ */ jsxs("div", { className: "apartment-sale-card", onClick: handleCardClick, children: [
    /* @__PURE__ */ jsxs("div", { className: "apartment-sale-card__image-container", children: [
      /* @__PURE__ */ jsx(
        "img",
        {
          src: apartment.images && apartment.images.length > 0 ? apartment.images[0] : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="24" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E',
          alt: apartment.name,
          className: "apartment-sale-card__image",
          onError: (e) => {
            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="24" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
          }
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "apartment-sale-card__availability", children: getAvailabilityCount() }),
      /* @__PURE__ */ jsx("div", { className: "apartment-sale-card__sale-badge", children: "For Sale" }),
      apartment.showDelete && /* @__PURE__ */ jsx(
        "button",
        {
          className: "apartment-sale-card__delete-btn",
          onClick: (e) => {
            e.stopPropagation();
            apartment.onDelete && apartment.onDelete(apartment.id);
          },
          title: "Remove listing",
          children: /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faTrash })
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "apartment-sale-card__content", children: [
      /* @__PURE__ */ jsx("h3", { className: "apartment-sale-card__title", children: apartment.name }),
      /* @__PURE__ */ jsxs("div", { className: "apartment-sale-card__location", children: [
        /* @__PURE__ */ jsx("span", { className: "location-icon", children: /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faMapMarkerAlt }) }),
        /* @__PURE__ */ jsx("span", { children: apartment.location })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "apartment-sale-card__details", children: [
        /* @__PURE__ */ jsxs("span", { className: "detail-item", children: [
          /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faBed }),
          " ",
          apartment.bedrooms || "N/A"
        ] }),
        /* @__PURE__ */ jsxs("span", { className: "detail-item", children: [
          /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faShower }),
          " ",
          apartment.bathrooms || "N/A"
        ] }),
        /* @__PURE__ */ jsxs("span", { className: "detail-item", children: [
          /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faRuler }),
          " ",
          apartment.area ? `${apartment.area} sq ft` : "N/A"
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "apartment-sale-card__price", children: formatPrice(apartment.price) })
    ] })
  ] });
};
const BuyApartmentPage = () => {
  const [allSaleApartments, setAllSaleApartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError2] = useState(null);
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState("all");
  const [bedroomFilter, setBedroomFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const transformSaleApartmentData = (apiApartment) => {
    var _a;
    return {
      id: apiApartment.id,
      title: apiApartment.name,
      name: apiApartment.name,
      location: apiApartment.location,
      address: apiApartment.address,
      price: parseFloat(apiApartment.price) || 0,
      area: parseFloat(apiApartment.area) || 0,
      bedrooms: apiApartment.bedrooms,
      bathrooms: apiApartment.bathrooms === "private" ? 1 : 0.5,
      description: apiApartment.description,
      images: apiApartment.photos_url || [],
      contactNumber: apiApartment.contact_number,
      floor: apiApartment.floor,
      unitNumber: apiApartment.number,
      amenities: ((_a = apiApartment.facilities_amenities) == null ? void 0 : _a.split(", ")) || [],
      mapLocation: apiApartment.location_on_map,
      createdAt: apiApartment.created_at,
      updatedAt: apiApartment.updated_at,
      listedByAdminId: apiApartment.listed_by_admin_id,
      // Frontend compatibility
      type: "sale",
      ownership: "Sale",
      postedDate: new Date(apiApartment.created_at).toLocaleDateString() || "Recently",
      isAvailable: true,
      completionStatus: "Ready",
      coordinates: { lat: 30.0444, lng: 31.2357 }
      // Default Cairo coordinates
    };
  };
  const fetchSaleApartments = async () => {
    try {
      setIsLoading(true);
      setError2(null);
      const response = await saleApartmentsApi.getAll();
      const transformedApartments = response.map(transformSaleApartmentData);
      setAllSaleApartments(transformedApartments);
      return { success: true, apartments: transformedApartments };
    } catch (error2) {
      const errorMessage = handleApiError(error2, "Failed to load apartments for sale");
      setError2(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchSaleApartments();
  }, []);
  const filteredApartments = allSaleApartments.filter((apartment) => {
    if (priceRange === "all") ;
    else if (priceRange === "low" && apartment.price >= 4e6) {
      return false;
    } else if (priceRange === "high" && apartment.price < 4e6) {
      return false;
    }
    if (bedroomFilter === "all") ;
    else if (bedroomFilter === "1" && apartment.bedrooms !== 1) {
      return false;
    } else if (bedroomFilter === "2" && apartment.bedrooms !== 2) {
      return false;
    } else if (bedroomFilter === "3+" && apartment.bedrooms < 3) {
      return false;
    }
    if (locationFilter !== "all") {
      if (!apartment.location || !apartment.location.toLowerCase().includes(locationFilter.toLowerCase())) {
        return false;
      }
    }
    return true;
  });
  const sortedApartments = [...filteredApartments].sort((a, b) => {
    if (sortBy === "price-low") return (a.price || 0) - (b.price || 0);
    if (sortBy === "price-high") return (b.price || 0) - (a.price || 0);
    if (sortBy === "area-low") return (a.area || 0) - (b.area || 0);
    if (sortBy === "area-high") return (b.area || 0) - (a.area || 0);
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
  const handleRetry = () => {
    fetchSaleApartments();
  };
  return /* @__PURE__ */ jsxs("div", { className: "buy-apartment-page", children: [
    /* @__PURE__ */ jsxs("nav", { className: "apartments-nav", children: [
      /* @__PURE__ */ jsx(BackButton, { text: "← Back", to: "/" }),
      /* @__PURE__ */ jsxs("div", { className: "brand", children: [
        /* @__PURE__ */ jsx("img", { src: aygLogo, alt: "AYG Logo", className: "brand-logo" }),
        /* @__PURE__ */ jsx("span", { className: "brand-text", children: "AYG" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "apartments-container", children: [
      /* @__PURE__ */ jsxs("header", { className: "apartments-header", children: [
        /* @__PURE__ */ jsx("h1", { children: "Apartments for Sale" }),
        !isLoading && !error && /* @__PURE__ */ jsxs("p", { children: [
          sortedApartments.length,
          " properties found"
        ] })
      ] }),
      error && /* @__PURE__ */ jsx("div", { className: "error-state", children: /* @__PURE__ */ jsxs("div", { className: "error-content", children: [
        /* @__PURE__ */ jsx("h3", { children: "Failed to Load Apartments" }),
        /* @__PURE__ */ jsx("p", { children: error }),
        /* @__PURE__ */ jsx("button", { className: "retry-btn", onClick: handleRetry, children: "Try Again" })
      ] }) }),
      isLoading && !error && /* @__PURE__ */ jsx("div", { className: "loading-state", children: /* @__PURE__ */ jsx("div", { className: "loading-spinner" }) }),
      !isLoading && !error && /* @__PURE__ */ jsxs("div", { className: "filters-section", children: [
        /* @__PURE__ */ jsxs("div", { className: "filter-group", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "location", children: "Location:" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              id: "location",
              value: locationFilter,
              onChange: (e) => setLocationFilter(e.target.value),
              className: "filter-select",
              children: [
                /* @__PURE__ */ jsx("option", { value: "all", children: "All Locations" }),
                /* @__PURE__ */ jsx("option", { value: "maadi", children: "Maadi" }),
                /* @__PURE__ */ jsx("option", { value: "mokkattam", children: "Mokkattam" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "filter-group", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "sort", children: "Sort by:" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              id: "sort",
              value: sortBy,
              onChange: (e) => setSortBy(e.target.value),
              className: "filter-select",
              children: [
                /* @__PURE__ */ jsx("option", { value: "newest", children: "Newest Listed" }),
                /* @__PURE__ */ jsx("option", { value: "price-low", children: "Price: Low to High" }),
                /* @__PURE__ */ jsx("option", { value: "price-high", children: "Price: High to Low" }),
                /* @__PURE__ */ jsx("option", { value: "area-low", children: "Area: Small to Large" }),
                /* @__PURE__ */ jsx("option", { value: "area-high", children: "Area: Large to Small" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "filter-group", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "price", children: "Price Range:" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              id: "price",
              value: priceRange,
              onChange: (e) => setPriceRange(e.target.value),
              className: "filter-select",
              children: [
                /* @__PURE__ */ jsx("option", { value: "all", children: "All Prices" }),
                /* @__PURE__ */ jsx("option", { value: "low", children: "Under 4M EGP" }),
                /* @__PURE__ */ jsx("option", { value: "high", children: "Above 4M EGP" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "filter-group", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "bedrooms", children: "Bedrooms:" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              id: "bedrooms",
              value: bedroomFilter,
              onChange: (e) => setBedroomFilter(e.target.value),
              className: "filter-select",
              children: [
                /* @__PURE__ */ jsx("option", { value: "all", children: "All" }),
                /* @__PURE__ */ jsx("option", { value: "1", children: "1 Bedroom" }),
                /* @__PURE__ */ jsx("option", { value: "2", children: "2 Bedrooms" }),
                /* @__PURE__ */ jsx("option", { value: "3+", children: "3+ Bedrooms" })
              ]
            }
          )
        ] })
      ] }),
      !isLoading && !error && /* @__PURE__ */ jsx("div", { className: "apartments-grid", children: sortedApartments.map((apartment) => /* @__PURE__ */ jsx(ApartmentSaleCard, { apartment }, apartment.id)) }),
      !isLoading && !error && sortedApartments.length === 0 && allSaleApartments.length === 0 && /* @__PURE__ */ jsxs("div", { className: "no-results", children: [
        /* @__PURE__ */ jsx("h3", { children: "No apartments available" }),
        /* @__PURE__ */ jsx("p", { children: "There are currently no apartments listed for sale. Please check back later." })
      ] }),
      !isLoading && !error && sortedApartments.length === 0 && allSaleApartments.length > 0 && /* @__PURE__ */ jsxs("div", { className: "no-results", children: [
        /* @__PURE__ */ jsx("h3", { children: "No apartments found" }),
        /* @__PURE__ */ jsx("p", { children: "Try adjusting your filters to see more options." })
      ] })
    ] }),
    /* @__PURE__ */ jsx(Footer, {})
  ] });
};
const ApartmentSaleDetailsPage$1 = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [apartment, setApartment] = useState(null);
  const [loading, setLoading2] = useState(true);
  const [error, setError2] = useState(null);
  const [adminPhone, setAdminPhone] = useState(null);
  useEffect(() => {
    const fetchApartmentDetails = async () => {
      setLoading2(true);
      setError2(null);
      try {
        const response = await saleApartmentsApi.getById(id);
        if (response) {
          setApartment(response);
          const isMasterAdmin = response.listed_by_admin_id === 1;
          const masterAdminPhone = "+201029936060";
          setAdminPhone(isMasterAdmin ? masterAdminPhone : response.contact_number || "+201000000000");
        } else {
          setError2("Apartment not found");
        }
      } catch (err) {
        setError2("Failed to load apartment details");
      } finally {
        setLoading2(false);
      }
    };
    if (id) {
      fetchApartmentDetails();
    }
  }, [id]);
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "apartment-details-page", children: /* @__PURE__ */ jsx("div", { className: "container", children: /* @__PURE__ */ jsx("div", { className: "loading-container", children: /* @__PURE__ */ jsx(LoadingSpinner, { size: "large" }) }) }) });
  }
  if (error) {
    return /* @__PURE__ */ jsx("div", { className: "apartment-details-page", children: /* @__PURE__ */ jsx("div", { className: "container", children: /* @__PURE__ */ jsxs("div", { className: "error-container", children: [
      /* @__PURE__ */ jsx("h1", { children: "Error Loading Apartment" }),
      /* @__PURE__ */ jsx("p", { className: "error-message", children: error }),
      /* @__PURE__ */ jsx(BackButton, { onClick: () => navigate(-1) })
    ] }) }) });
  }
  if (!apartment) {
    return /* @__PURE__ */ jsx("div", { className: "apartment-details-page", children: /* @__PURE__ */ jsxs("div", { className: "container", children: [
      /* @__PURE__ */ jsx("h1", { children: "Apartment not found" }),
      /* @__PURE__ */ jsx(BackButton, { onClick: () => navigate("/") })
    ] }) });
  }
  const formatPrice = (price) => {
    if (!price) return "Contact for price";
    return `EGP ${price.toLocaleString()}`;
  };
  const openGoogleMaps = () => {
    if (apartment.location_coordinates && apartment.location_coordinates.lat && apartment.location_coordinates.lng) {
      const mapsUrl = `https://www.google.com/maps?q=${apartment.location_coordinates.lat},${apartment.location_coordinates.lng}`;
      window.open(mapsUrl, "_blank", "noopener,noreferrer");
    } else if (apartment.location) {
      const searchQuery = encodeURIComponent(apartment.location);
      const mapsUrl = `https://www.google.com/maps/search/${searchQuery}`;
      window.open(mapsUrl, "_blank", "noopener,noreferrer");
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "apartment-details-page", children: [
    /* @__PURE__ */ jsxs("nav", { className: "apartment-nav", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          className: "back-to-apartments-btn",
          onClick: () => navigate("/buy-apartments"),
          children: "← Back to Apartments"
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "brand", children: [
        /* @__PURE__ */ jsx("img", { src: aygLogo, alt: "AYG Logo", className: "brand-logo" }),
        /* @__PURE__ */ jsx("span", { className: "brand-text", children: "AYG" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "apartment-container", children: [
      /* @__PURE__ */ jsx("div", { className: "apartment-gallery-section", children: /* @__PURE__ */ jsx(
        ImageGallery,
        {
          images: apartment.images || [],
          title: apartment.name || apartment.title,
          fallbackImage: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Crect fill='%23f0f0f0' width='800' height='600'/%3E%3Ctext fill='%23999' font-family='sans-serif' font-size='32' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3ENo Image Available%3C/text%3E%3C/svg%3E"
        }
      ) }),
      /* @__PURE__ */ jsxs("div", { className: "apartment-content", children: [
        /* @__PURE__ */ jsxs("div", { className: "apartment-card apartment-main-info", children: [
          /* @__PURE__ */ jsxs("div", { className: "apartment-header", children: [
            /* @__PURE__ */ jsxs("div", { className: "apartment-title-section", children: [
              /* @__PURE__ */ jsx("h1", { className: "apartment-title", children: apartment.name || apartment.title }),
              /* @__PURE__ */ jsx("div", { className: "apartment-subtitle", children: apartment.apartment_number && /* @__PURE__ */ jsx("span", { className: "apartment-number", children: apartment.apartment_number }) })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "apartment-price-section", children: /* @__PURE__ */ jsx("div", { className: "apartment-price", children: formatPrice(apartment.price || apartment.sale_price) }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "apartment-posted", children: [
            "Listed ",
            apartment.created_at ? new Date(apartment.created_at).toLocaleDateString() : "Recently"
          ] }),
          (apartment.location_coordinates || apartment.location) && /* @__PURE__ */ jsxs("div", { className: "apartment-location-section", children: [
            /* @__PURE__ */ jsxs("h3", { children: [
              /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faMapMarkerAlt }),
              " Location"
            ] }),
            /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: openGoogleMaps,
                className: "maps-button",
                type: "button",
                children: [
                  /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faMap }),
                  " View on Google Maps"
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "apartment-features", children: [
            /* @__PURE__ */ jsx("h2", { children: "Property Highlights" }),
            /* @__PURE__ */ jsxs("div", { className: "highlights-grid", children: [
              /* @__PURE__ */ jsxs("div", { className: "highlight-item", children: [
                /* @__PURE__ */ jsx("div", { className: "highlight-icon", children: /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faHome }) }),
                /* @__PURE__ */ jsxs("div", { className: "highlight-content", children: [
                  /* @__PURE__ */ jsx("div", { className: "highlight-label", children: "Type" }),
                  /* @__PURE__ */ jsx("div", { className: "highlight-value", children: "Apartment" })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "highlight-item", children: [
                /* @__PURE__ */ jsx("div", { className: "highlight-icon", children: /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faKey }) }),
                /* @__PURE__ */ jsxs("div", { className: "highlight-content", children: [
                  /* @__PURE__ */ jsx("div", { className: "highlight-label", children: "Ownership" }),
                  /* @__PURE__ */ jsx("div", { className: "highlight-value", children: "For Sale" })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "highlight-item", children: [
                /* @__PURE__ */ jsx("div", { className: "highlight-icon", children: /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faRuler }) }),
                /* @__PURE__ */ jsxs("div", { className: "highlight-content", children: [
                  /* @__PURE__ */ jsx("div", { className: "highlight-label", children: "Area" }),
                  /* @__PURE__ */ jsx("div", { className: "highlight-value", children: apartment.area ? `${apartment.area} m²` : "N/A" })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "highlight-item", children: [
                /* @__PURE__ */ jsx("div", { className: "highlight-icon", children: /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faBed }) }),
                /* @__PURE__ */ jsxs("div", { className: "highlight-content", children: [
                  /* @__PURE__ */ jsx("div", { className: "highlight-label", children: "Bedrooms" }),
                  /* @__PURE__ */ jsx("div", { className: "highlight-value", children: apartment.bedrooms || apartment.number_of_bedrooms || "N/A" })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "highlight-item", children: [
                /* @__PURE__ */ jsx("div", { className: "highlight-icon", children: /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faShower }) }),
                /* @__PURE__ */ jsxs("div", { className: "highlight-content", children: [
                  /* @__PURE__ */ jsx("div", { className: "highlight-label", children: "Bathrooms" }),
                  /* @__PURE__ */ jsx("div", { className: "highlight-value", children: apartment.bathrooms || apartment.number_of_bathrooms || "N/A" })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "highlight-item", children: [
                /* @__PURE__ */ jsx("div", { className: "highlight-icon", children: /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faMoneyBillWave }) }),
                /* @__PURE__ */ jsxs("div", { className: "highlight-content", children: [
                  /* @__PURE__ */ jsx("div", { className: "highlight-label", children: "Price" }),
                  /* @__PURE__ */ jsx("div", { className: "highlight-value", children: formatPrice(apartment.price || apartment.sale_price) })
                ] })
              ] })
            ] })
          ] }),
          apartment.description && /* @__PURE__ */ jsxs("div", { className: "apartment-description", children: [
            /* @__PURE__ */ jsx("h2", { children: "Description" }),
            /* @__PURE__ */ jsx("p", { children: apartment.description })
          ] }),
          (apartment.amenities && apartment.amenities.length > 0 || apartment.facilities && apartment.facilities.length > 0) && /* @__PURE__ */ jsxs("div", { className: "amenities-section", children: [
            /* @__PURE__ */ jsx("h2", { children: "Facilities & Amenities" }),
            /* @__PURE__ */ jsx("div", { className: "amenities-grid", children: (apartment.facilities || apartment.amenities || []).map((amenity, index) => /* @__PURE__ */ jsxs("div", { className: "amenity-item", children: [
              /* @__PURE__ */ jsx("span", { className: "amenity-icon", children: /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faCheck }) }),
              /* @__PURE__ */ jsx("span", { className: "amenity-name", children: amenity })
            ] }, index)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "apartment-card apartment-details-card", children: [
          /* @__PURE__ */ jsxs("div", { className: "details-section", children: [
            /* @__PURE__ */ jsx("h2", { children: "Property Details" }),
            /* @__PURE__ */ jsxs("div", { className: "details-table", children: [
              /* @__PURE__ */ jsxs("div", { className: "detail-row", children: [
                /* @__PURE__ */ jsx("span", { className: "detail-label", children: "Apartment Number" }),
                /* @__PURE__ */ jsx("span", { className: "detail-value", children: apartment.apartment_number || "N/A" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "detail-row", children: [
                /* @__PURE__ */ jsx("span", { className: "detail-label", children: "Listing Date" }),
                /* @__PURE__ */ jsx("span", { className: "detail-value", children: apartment.created_at ? new Date(apartment.created_at).toLocaleDateString() : "Recently" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "detail-row", children: [
                /* @__PURE__ */ jsx("span", { className: "detail-label", children: "Listed By" }),
                /* @__PURE__ */ jsx("span", { className: "detail-value", children: apartment.created_by || "AYG" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "detail-row", children: [
                /* @__PURE__ */ jsx("span", { className: "detail-label", children: "Property Type" }),
                /* @__PURE__ */ jsx("span", { className: "detail-value", children: "Apartment for Sale" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "detail-row", children: [
                /* @__PURE__ */ jsx("span", { className: "detail-label", children: "Location" }),
                /* @__PURE__ */ jsx("span", { className: "detail-value", children: apartment.location })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "detail-row", children: [
                /* @__PURE__ */ jsx("span", { className: "detail-label", children: "Address" }),
                /* @__PURE__ */ jsx("span", { className: "detail-value", children: apartment.address || apartment.location })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "apartment-actions", children: /* @__PURE__ */ jsx(
            WhatsAppButton,
            {
              phoneNumber: adminPhone || apartment.contact_number || "+201000000000",
              message: `Hi! I'm interested in the apartment "${apartment.name || apartment.title}" listed for ${formatPrice(apartment.price || apartment.sale_price)}. Could you provide more details?`
            }
          ) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(Footer, {})
  ] });
};
const MapViewer = ({
  coordinates,
  mapUrl,
  address,
  height = "300px",
  showControls = true,
  onLocationUpdate
}) => {
  const [currentCoords, setCurrentCoords] = useState(coordinates || { lat: 30.0444, lng: 31.2357 });
  const [urlInput, setUrlInput] = useState(mapUrl || "");
  useEffect(() => {
    if (coordinates) {
      setCurrentCoords(coordinates);
    }
  }, [coordinates]);
  useEffect(() => {
    if (mapUrl) {
      setUrlInput(mapUrl);
      const extractedCoords = extractCoordsFromUrl(mapUrl);
      if (extractedCoords) {
        setCurrentCoords(extractedCoords);
        onLocationUpdate && onLocationUpdate(extractedCoords);
      }
    }
  }, [mapUrl, onLocationUpdate]);
  const extractCoordsFromUrl = (url) => {
    try {
      const patterns = [
        /@(-?\d+\.?\d*),(-?\d+\.?\d*)/,
        // @lat,lng format
        /q=(-?\d+\.?\d*),(-?\d+\.?\d*)/,
        // q=lat,lng format  
        /!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/,
        // !3dlat!4dlng format
        /ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/,
        // ll=lat,lng format
        /center=(-?\d+\.?\d*),(-?\d+\.?\d*)/,
        // center=lat,lng format
        /place\/[^/]*@(-?\d+\.?\d*),(-?\d+\.?\d*)/,
        // place/@lat,lng format
        /data=!3m1!1e3!4m5!3m4!1s[^!]*!8m2!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/,
        // complex format
        /!2d(-?\d+\.?\d*)!3d(-?\d+\.?\d*)/
        // !2dlng!3dlat format (reversed)
      ];
      for (let i = 0; i < patterns.length; i++) {
        const pattern = patterns[i];
        const match = url.match(pattern);
        if (match) {
          if (i === 7) {
            return {
              lat: parseFloat(match[2]),
              // lng becomes lat
              lng: parseFloat(match[1])
              // lat becomes lng
            };
          }
          return {
            lat: parseFloat(match[1]),
            lng: parseFloat(match[2])
          };
        }
      }
      const urlObj = new URL(url);
      const params = new URLSearchParams(urlObj.search);
      const qParam = params.get("q");
      if (qParam) {
        const coordMatch = qParam.match(/(-?\d+\.?\d*),(-?\d+\.?\d*)/);
        if (coordMatch) {
          return {
            lat: parseFloat(coordMatch[1]),
            lng: parseFloat(coordMatch[2])
          };
        }
      }
    } catch (error) {
    }
    return null;
  };
  const handleUrlInput = (url) => {
    setUrlInput(url);
    if (url.trim()) {
      const extractedCoords = extractCoordsFromUrl(url);
      if (extractedCoords) {
        setCurrentCoords(extractedCoords);
        onLocationUpdate && onLocationUpdate(extractedCoords);
      }
    }
  };
  const handleCoordinateChange = (field, value) => {
    const newCoords = {
      ...currentCoords,
      [field]: parseFloat(value) || 0
    };
    setCurrentCoords(newCoords);
    onLocationUpdate && onLocationUpdate(newCoords);
  };
  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps?q=${currentCoords.lat},${currentCoords.lng}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };
  return /* @__PURE__ */ jsxs("div", { className: "map-viewer", style: { height }, children: [
    showControls && /* @__PURE__ */ jsxs("div", { className: "map-controls", children: [
      /* @__PURE__ */ jsxs("div", { className: "url-input-section", children: [
        /* @__PURE__ */ jsx("label", { children: "Google Maps URL:" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "url",
            value: urlInput,
            onChange: (e) => handleUrlInput(e.target.value),
            placeholder: "Paste Google Maps URL here to extract coordinates...",
            className: "url-input"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "coordinate-inputs", children: [
        /* @__PURE__ */ jsxs("div", { className: "coord-input", children: [
          /* @__PURE__ */ jsx("label", { children: "Latitude:" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              step: "any",
              value: currentCoords.lat,
              onChange: (e) => handleCoordinateChange("lat", e.target.value),
              placeholder: "30.0444"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "coord-input", children: [
          /* @__PURE__ */ jsx("label", { children: "Longitude:" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              step: "any",
              value: currentCoords.lng,
              onChange: (e) => handleCoordinateChange("lng", e.target.value),
              placeholder: "31.2357"
            }
          )
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            className: "open-maps-btn",
            onClick: openInGoogleMaps,
            title: "Open in Google Maps",
            children: "🗺️ Open in Maps"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "map-container", children: /* @__PURE__ */ jsx("div", { className: "map-placeholder", children: /* @__PURE__ */ jsxs("div", { className: "map-info", children: [
      /* @__PURE__ */ jsx("h4", { children: "📍 Location Preview" }),
      /* @__PURE__ */ jsxs("p", { children: [
        /* @__PURE__ */ jsx("strong", { children: "Coordinates:" }),
        " ",
        currentCoords.lat.toFixed(6),
        ", ",
        currentCoords.lng.toFixed(6)
      ] }),
      address && /* @__PURE__ */ jsxs("p", { children: [
        /* @__PURE__ */ jsx("strong", { children: "Address:" }),
        " ",
        address
      ] }),
      /* @__PURE__ */ jsx("div", { className: "map-actions", children: /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          className: "view-map-btn",
          onClick: openInGoogleMaps,
          children: "🔗 View in Google Maps"
        }
      ) })
    ] }) }) }),
    /* @__PURE__ */ jsx("div", { className: "map-hint", children: "💡 Tip: You can paste a Google Maps URL above to automatically extract coordinates, or manually enter latitude and longitude values." })
  ] });
};
const ApartmentSaleDetailsPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [navigationSource, setNavigationSource] = useState("admin-dashboard");
  const [apartment, setApartment] = useState(null);
  const [loading, setLoading2] = useState(true);
  const [error, setError2] = useState(null);
  useEffect(() => {
    const fetchApartment = async () => {
      try {
        setLoading2(true);
        setError2(null);
        const response = await saleApartmentsApi.getById(id);
        const transformedApartment = {
          id: response.id,
          name: response.name,
          title: response.name,
          location: response.location,
          address: response.address,
          price: parseFloat(response.price) || 0,
          area: parseFloat(response.area) || 0,
          bedrooms: response.bedrooms,
          bathrooms: response.bathrooms,
          description: response.description,
          images: response.photos_url || [],
          contactNumber: response.contact_number,
          floor: response.floor,
          unitNumber: response.number,
          apartmentNumber: response.number,
          createdBy: response.listed_by_admin_id,
          createdAt: response.created_at,
          updatedAt: response.updated_at,
          isAvailable: true,
          listedAt: response.created_at,
          facilities: response.facilities_amenities ? typeof response.facilities_amenities === "string" ? response.facilities_amenities.split(",").map((f) => f.trim()) : response.facilities_amenities : [],
          coordinates: response.location_on_map ? { url: response.location_on_map } : null
        };
        setApartment(transformedApartment);
      } catch (err) {
        setError2("Failed to load apartment details");
      } finally {
        setLoading2(false);
      }
    };
    if (id) {
      fetchApartment();
    }
  }, [id]);
  useEffect(() => {
    const source = searchParams.get("source");
    if (["master-admin-dashboard", "customer-apartments", "admin-dashboard"].includes(source)) {
      setNavigationSource(source);
    } else {
      setNavigationSource("admin-dashboard");
    }
  }, [searchParams]);
  const getBackLink = () => {
    if (navigationSource === "master-admin-dashboard") {
      return "/master-admin/dashboard";
    } else if (navigationSource === "admin-dashboard") {
      return "/admin/dashboard";
    } else if (navigationSource === "customer-apartments") {
      return "/apartments-sale";
    }
    return "/admin/dashboard";
  };
  const getBackText = () => {
    if (navigationSource === "master-admin-dashboard") {
      return "← Back to Master Admin Dashboard";
    } else if (navigationSource === "admin-dashboard") {
      return "← Back to Admin Dashboard";
    } else if (navigationSource === "customer-apartments") {
      return "← Back to Apartments for Sale";
    }
    return "← Back to Admin Dashboard";
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "apartment-sale-details-page", children: /* @__PURE__ */ jsxs("div", { className: "container", style: { textAlign: "center", padding: "50px" }, children: [
      /* @__PURE__ */ jsx(LoadingSpinner, { size: "large" }),
      /* @__PURE__ */ jsx("p", { children: "Loading apartment details..." })
    ] }) });
  }
  if (error || !apartment) {
    return /* @__PURE__ */ jsx("div", { className: "apartment-sale-details-page", children: /* @__PURE__ */ jsxs("div", { className: "container", style: { textAlign: "center", padding: "50px" }, children: [
      /* @__PURE__ */ jsx("h1", { children: "Apartment not found" }),
      /* @__PURE__ */ jsx("p", { children: error || "The apartment you are looking for does not exist." }),
      /* @__PURE__ */ jsx(BackButton, { onClick: () => navigate(getBackLink()) })
    ] }) });
  }
  const formatPrice = (price) => {
    if (!price) return "Contact for price";
    if (price >= 1e6) {
      return `${(price / 1e6).toFixed(1)}M EGP`;
    }
    return price.toLocaleString("en-EG") + " EGP";
  };
  const openGoogleMaps = () => {
    if (apartment.coordinates && apartment.coordinates.lat && apartment.coordinates.lng) {
      const mapsUrl = `https://www.google.com/maps?q=${apartment.coordinates.lat},${apartment.coordinates.lng}`;
      window.open(mapsUrl, "_blank", "noopener,noreferrer");
    } else {
      const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(apartment.location)}`;
      window.open(mapsUrl, "_blank", "noopener,noreferrer");
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "apartment-sale-details-page", children: [
    /* @__PURE__ */ jsxs("nav", { className: "apartment-nav", children: [
      /* @__PURE__ */ jsx(
        BackButton,
        {
          text: getBackText(),
          onClick: () => navigate(getBackLink())
        }
      ),
      /* @__PURE__ */ jsx(
        Link,
        {
          to: navigationSource === "master-admin-dashboard" ? "/master-admin/dashboard" : "/admin/dashboard",
          className: "brand",
          children: /* @__PURE__ */ jsx("img", { src: aygLogo, alt: "AYG Logo", className: "brand-logo" })
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "apartment-container", children: [
      /* @__PURE__ */ jsx("div", { className: "apartment-gallery-section", children: apartment.images && apartment.images.length > 0 ? /* @__PURE__ */ jsx(
        ImageGallery,
        {
          images: apartment.images,
          title: apartment.name
        }
      ) : /* @__PURE__ */ jsx("div", { className: "no-images-placeholder", style: {
        width: "100%",
        height: "400px",
        backgroundColor: "#f0f0f0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "8px"
      }, children: /* @__PURE__ */ jsx("p", { style: { color: "#666", fontSize: "18px" }, children: "📷 No images available" }) }) }),
      /* @__PURE__ */ jsxs("div", { className: "apartment-content", children: [
        /* @__PURE__ */ jsxs("div", { className: "apartment-main-info", children: [
          /* @__PURE__ */ jsxs("div", { className: "apartment-header", children: [
            /* @__PURE__ */ jsx("h1", { className: "apartment-title", children: apartment.name }),
            /* @__PURE__ */ jsx("div", { className: "apartment-price", children: formatPrice(apartment.price) }),
            /* @__PURE__ */ jsx("div", { className: "apartment-status", children: /* @__PURE__ */ jsx("span", { className: `status-badge ${apartment.isAvailable ? "available" : "sold"}`, children: apartment.isAvailable ? "Available for Sale" : "Sold" }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "apartment-location", onClick: openGoogleMaps, children: [
            "📍 ",
            apartment.location,
            /* @__PURE__ */ jsx("span", { className: "location-link", children: "See location" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "apartment-posted", children: [
            "Listed ",
            new Date(apartment.listedAt || apartment.createdAt).toLocaleDateString()
          ] }),
          navigationSource === "master-admin-dashboard" && apartment.createdBy && /* @__PURE__ */ jsxs("div", { className: "creator-info-section", children: [
            /* @__PURE__ */ jsxs("div", { className: "creator-info", children: [
              /* @__PURE__ */ jsx("span", { className: "creator-label", children: "👤 Created by Admin:" }),
              /* @__PURE__ */ jsx("span", { className: "creator-value", children: apartment.createdBy })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "creator-date", children: [
              /* @__PURE__ */ jsx("span", { className: "creator-label", children: "📅 Created on:" }),
              /* @__PURE__ */ jsx("span", { className: "creator-value", children: apartment.listedAt ? new Date(apartment.listedAt).toLocaleDateString() : "N/A" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "highlights-section", children: [
            /* @__PURE__ */ jsx("h2", { children: "Property Highlights" }),
            /* @__PURE__ */ jsxs("div", { className: "highlights-grid", children: [
              /* @__PURE__ */ jsxs("div", { className: "highlight-item", children: [
                /* @__PURE__ */ jsx("div", { className: "highlight-icon", children: "🏢" }),
                /* @__PURE__ */ jsxs("div", { className: "highlight-content", children: [
                  /* @__PURE__ */ jsx("div", { className: "highlight-label", children: "Type" }),
                  /* @__PURE__ */ jsx("div", { className: "highlight-value", children: "Apartment for Sale" })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "highlight-item", children: [
                /* @__PURE__ */ jsx("div", { className: "highlight-icon", children: "#️⃣" }),
                /* @__PURE__ */ jsxs("div", { className: "highlight-content", children: [
                  /* @__PURE__ */ jsx("div", { className: "highlight-label", children: "Apartment Number" }),
                  /* @__PURE__ */ jsx("div", { className: "highlight-value", children: apartment.apartmentNumber || "N/A" })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "highlight-item", children: [
                /* @__PURE__ */ jsx("div", { className: "highlight-icon", children: "📏" }),
                /* @__PURE__ */ jsxs("div", { className: "highlight-content", children: [
                  /* @__PURE__ */ jsx("div", { className: "highlight-label", children: "Area" }),
                  /* @__PURE__ */ jsx("div", { className: "highlight-value", children: apartment.area ? `${apartment.area} sq ft` : "N/A" })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "highlight-item", children: [
                /* @__PURE__ */ jsx("div", { className: "highlight-icon", children: "🛏️" }),
                /* @__PURE__ */ jsxs("div", { className: "highlight-content", children: [
                  /* @__PURE__ */ jsx("div", { className: "highlight-label", children: "Bedrooms" }),
                  /* @__PURE__ */ jsx("div", { className: "highlight-value", children: apartment.bedrooms || "N/A" })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "highlight-item", children: [
                /* @__PURE__ */ jsx("div", { className: "highlight-icon", children: "🚿" }),
                /* @__PURE__ */ jsxs("div", { className: "highlight-content", children: [
                  /* @__PURE__ */ jsx("div", { className: "highlight-label", children: "Bathrooms" }),
                  /* @__PURE__ */ jsx("div", { className: "highlight-value", children: apartment.bathrooms || "N/A" })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "highlight-item", children: [
                /* @__PURE__ */ jsx("div", { className: "highlight-icon", children: "💰" }),
                /* @__PURE__ */ jsxs("div", { className: "highlight-content", children: [
                  /* @__PURE__ */ jsx("div", { className: "highlight-label", children: "Price" }),
                  /* @__PURE__ */ jsx("div", { className: "highlight-value", children: formatPrice(apartment.price) })
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "details-section", children: [
            /* @__PURE__ */ jsx("h2", { children: "Property Details" }),
            /* @__PURE__ */ jsxs("div", { className: "details-table", children: [
              /* @__PURE__ */ jsxs("div", { className: "detail-row", children: [
                /* @__PURE__ */ jsx("span", { className: "detail-label", children: "Address" }),
                /* @__PURE__ */ jsx("span", { className: "detail-value", children: apartment.address || apartment.location })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "detail-row", children: [
                /* @__PURE__ */ jsx("span", { className: "detail-label", children: "Bedrooms" }),
                /* @__PURE__ */ jsx("span", { className: "detail-value", children: apartment.bedrooms || "N/A" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "detail-row", children: [
                /* @__PURE__ */ jsx("span", { className: "detail-label", children: "Bathrooms" }),
                /* @__PURE__ */ jsx("span", { className: "detail-value", children: apartment.bathrooms || "N/A" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "detail-row", children: [
                /* @__PURE__ */ jsx("span", { className: "detail-label", children: "Area" }),
                /* @__PURE__ */ jsx("span", { className: "detail-value", children: apartment.area ? `${apartment.area} sq ft` : "N/A" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "detail-row", children: [
                /* @__PURE__ */ jsx("span", { className: "detail-label", children: "Apartment Number" }),
                /* @__PURE__ */ jsx("span", { className: "detail-value", children: apartment.apartmentNumber || "N/A" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "detail-row", children: [
                /* @__PURE__ */ jsx("span", { className: "detail-label", children: "Status" }),
                /* @__PURE__ */ jsx("span", { className: "detail-value", children: apartment.isAvailable ? "Available" : "Sold" })
              ] })
            ] })
          ] }),
          apartment.facilities && apartment.facilities.length > 0 && /* @__PURE__ */ jsxs("div", { className: "facilities-section", children: [
            /* @__PURE__ */ jsx("h2", { children: "Facilities & Amenities" }),
            /* @__PURE__ */ jsx("div", { className: "facilities-grid", children: apartment.facilities.map((facility, index) => /* @__PURE__ */ jsxs("div", { className: "facility-item", children: [
              /* @__PURE__ */ jsx("span", { className: "facility-icon", children: "✓" }),
              /* @__PURE__ */ jsx("span", { className: "facility-name", children: facility })
            ] }, index)) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "description-section", children: [
            /* @__PURE__ */ jsx("h2", { children: "Description" }),
            /* @__PURE__ */ jsx("p", { className: "description-text", children: apartment.description || `Beautiful ${apartment.bedrooms}-bedroom apartment for sale in ${apartment.location}. This property offers ${apartment.area} sq ft of living space with ${apartment.bathrooms} bathrooms. Perfect for families or investors looking for quality real estate in a prime location.` })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "location-section", children: [
            /* @__PURE__ */ jsx("h2", { children: "Location" }),
            /* @__PURE__ */ jsxs("div", { className: "location-info", children: [
              /* @__PURE__ */ jsxs("div", { className: "location-text", children: [
                "📍 ",
                apartment.location
              ] }),
              /* @__PURE__ */ jsx("button", { className: "location-button", onClick: openGoogleMaps, children: "🗺️ See location" })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "interactive-map", children: apartment.coordinates && apartment.coordinates.lat && apartment.coordinates.lng ? /* @__PURE__ */ jsx(
              MapViewer,
              {
                coordinates: apartment.coordinates,
                address: apartment.location,
                height: "400px",
                showControls: false
              }
            ) : /* @__PURE__ */ jsxs("div", { className: "map-placeholder", children: [
              /* @__PURE__ */ jsxs("p", { children: [
                "📍 ",
                apartment.location
              ] }),
              /* @__PURE__ */ jsx("button", { className: "location-button", onClick: openGoogleMaps, children: "🗺️ View on Google Maps" })
            ] }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "apartment-sidebar", children: [
          /* @__PURE__ */ jsxs("div", { className: "contact-card", children: [
            /* @__PURE__ */ jsx("h3", { children: "Listed by agency" }),
            /* @__PURE__ */ jsxs("div", { className: "agency-info", children: [
              /* @__PURE__ */ jsx("div", { className: "agency-name", children: "AYG" }),
              /* @__PURE__ */ jsx("div", { className: "agency-rating", children: "⭐ 4 C" }),
              /* @__PURE__ */ jsx("div", { className: "agency-member", children: "Member since Sept 2024" })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "contact-actions", children: /* @__PURE__ */ jsx(
              WhatsAppButton,
              {
                phoneNumber: apartment.contactNumber || "+201234567890",
                message: `Hello, I'm interested in ${apartment.name} for ${formatPrice(apartment.price)}`
              }
            ) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "price-summary-card", children: [
            /* @__PURE__ */ jsx("h3", { children: "Price Summary" }),
            /* @__PURE__ */ jsxs("div", { className: "price-details", children: [
              /* @__PURE__ */ jsxs("div", { className: "price-main", children: [
                /* @__PURE__ */ jsx("span", { className: "price-label", children: "Sale Price" }),
                /* @__PURE__ */ jsx("span", { className: "price-value", children: formatPrice(apartment.price) })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "price-note", children: "Contact us for more details about payment plans and financing options." })
            ] })
          ] })
        ] })
      ] })
    ] })
  ] });
};
const usePropertyManagement = () => {
  const dispatch = useDispatch();
  const property = useSelector(selectProperty);
  const apartments = useSelector(selectApartments);
  const saleApartments = useSelector(selectSaleApartments);
  const isLoading = useSelector(selectPropertyLoading);
  const error = useSelector(selectPropertyError);
  const transformRentApartmentFromApi = (apiApartment) => ({
    id: apiApartment.id,
    title: apiApartment.name || apiApartment.title,
    // API uses 'name' field
    name: apiApartment.name,
    // Keep API field as well
    location: apiApartment.location,
    address: apiApartment.address,
    price: apiApartment.price,
    area: apiApartment.area,
    bedrooms: apiApartment.bedrooms,
    bathrooms: apiApartment.bathrooms,
    floor: apiApartment.floor,
    description: apiApartment.description,
    amenities: apiApartment.facilities_amenities ? [apiApartment.facilities_amenities] : [],
    images: apiApartment.photos_url || [],
    contactNumber: apiApartment.contact_number,
    coordinates: apiApartment.location_on_map ? { url: apiApartment.location_on_map } : { lat: 0, lng: 0 },
    totalStudios: apiApartment.total_parts || 0,
    availableStudios: 0,
    // Will be calculated from parts
    createdBy: apiApartment.listed_by_admin_id,
    listed_by_admin_id: apiApartment.listed_by_admin_id,
    createdAt: apiApartment.created_at,
    updatedAt: apiApartment.updated_at,
    studios: [],
    // Will be populated separately if needed
    // Legacy compatibility
    postedDate: apiApartment.created_at,
    isAvailable: true
  });
  const transformRentApartmentToApi = (frontendApartment) => {
    var _a, _b, _c;
    if (frontendApartment.name !== void 0 && typeof frontendApartment.name === "string") {
      return frontendApartment;
    }
    const transformed = {
      name: frontendApartment.title || frontendApartment.name || "Unnamed Apartment",
      location: (frontendApartment.location || "maadi").toLowerCase(),
      address: frontendApartment.address || "Address not provided",
      price: ((_a = frontendApartment.price) == null ? void 0 : _a.toString()) || "0",
      area: ((_b = frontendApartment.area) == null ? void 0 : _b.toString()) || "50",
      number: frontendApartment.number || frontendApartment.apartmentNumber || "APT-001",
      bedrooms: parseInt(frontendApartment.bedrooms) || 1,
      bathrooms: frontendApartment.bathrooms === "shared" ? "shared" : "private",
      description: frontendApartment.description || "No description provided",
      photos_url: frontendApartment.photos_url || frontendApartment.images || [],
      location_on_map: frontendApartment.location_on_map || ((_c = frontendApartment.coordinates) == null ? void 0 : _c.url) || frontendApartment.mapUrl || "",
      facilities_amenities: Array.isArray(frontendApartment.facilities_amenities) ? frontendApartment.facilities_amenities.join(", ") : frontendApartment.facilities_amenities || (Array.isArray(frontendApartment.facilities) ? frontendApartment.facilities.join(", ") : "") || (Array.isArray(frontendApartment.amenities) ? frontendApartment.amenities.join(", ") : ""),
      floor: parseInt(frontendApartment.floor) || 1,
      total_parts: parseInt(frontendApartment.total_parts || frontendApartment.totalParts || frontendApartment.totalStudios) || 1
    };
    return transformed;
  };
  const transformStudioFromApi = (apiStudio) => ({
    id: apiStudio.id,
    apartmentId: apiStudio.apartment_id,
    studioNumber: apiStudio.studio_number,
    area: apiStudio.area,
    price: apiStudio.price,
    furnished: apiStudio.furnished,
    amenities: apiStudio.amenities || [],
    images: apiStudio.images || [],
    description: apiStudio.description,
    isAvailable: apiStudio.is_available,
    contactNumber: apiStudio.contact_number,
    createdBy: apiStudio.created_by,
    createdAt: apiStudio.created_at,
    updatedAt: apiStudio.updated_at,
    // Legacy compatibility
    title: `Studio ${apiStudio.studio_number}`,
    bedrooms: 1,
    bathrooms: 1,
    postedDate: apiStudio.created_at
  });
  const transformStudioToApi = (frontendStudio) => {
    if (frontendStudio.title && frontendStudio.monthly_price && frontendStudio.bathrooms && frontendStudio.balcony) {
      return frontendStudio;
    }
    return {
      title: frontendStudio.title || frontendStudio.studioNumber || "Studio 1",
      area: frontendStudio.area ? frontendStudio.area.toString() : "25",
      monthly_price: frontendStudio.monthly_price || frontendStudio.price || "0",
      bedrooms: parseInt(frontendStudio.bedrooms) || 1,
      bathrooms: frontendStudio.bathrooms || "private",
      furnished: frontendStudio.furnished || "yes",
      balcony: frontendStudio.balcony || "no",
      description: frontendStudio.description || "",
      photos_url: frontendStudio.photos_url || frontendStudio.images || []
    };
  };
  const transformSaleApartmentFromApi = (apiApartment) => ({
    id: apiApartment.id,
    title: apiApartment.name || apiApartment.title,
    // API uses 'name' field
    name: apiApartment.name,
    // Keep API field as well
    location: apiApartment.location,
    address: apiApartment.address,
    price: apiApartment.price,
    area: apiApartment.area,
    number: apiApartment.number,
    bedrooms: apiApartment.bedrooms,
    bathrooms: apiApartment.bathrooms,
    description: apiApartment.description,
    amenities: apiApartment.facilities_amenities ? [apiApartment.facilities_amenities] : [],
    images: apiApartment.photos_url || [],
    contactNumber: apiApartment.contact_number,
    coordinates: apiApartment.location_on_map ? { url: apiApartment.location_on_map } : { lat: 0, lng: 0 },
    completionStatus: apiApartment.completion_status,
    floor: apiApartment.floor,
    unitNumber: apiApartment.unit_number,
    highlights: apiApartment.highlights || {},
    details: apiApartment.details || {},
    createdBy: apiApartment.listed_by_admin_id,
    listed_by_admin_id: apiApartment.listed_by_admin_id,
    createdAt: apiApartment.created_at,
    updatedAt: apiApartment.updated_at,
    // Legacy compatibility
    type: "sale",
    ownership: "Sale",
    postedDate: apiApartment.created_at,
    isAvailable: apiApartment.is_available !== false,
    listedAt: apiApartment.created_at
  });
  const transformSaleApartmentToApi = (frontendApartment) => {
    var _a;
    const transformed = {
      // === REQUIRED FIELDS ===
      name: (frontendApartment.name || frontendApartment.title || "").trim(),
      location: (frontendApartment.location || "").toString().toLowerCase().trim(),
      address: (frontendApartment.address || "").trim(),
      price: (frontendApartment.price || frontendApartment.salePrice || "").toString().trim(),
      area: (frontendApartment.area || "").toString().trim(),
      number: (frontendApartment.number || frontendApartment.apartmentNumber || frontendApartment.unitNumber || "").toString().trim(),
      bedrooms: parseInt(frontendApartment.bedrooms) || 0,
      bathrooms: frontendApartment.bathrooms === "shared" ? "shared" : "private",
      // === OPTIONAL FIELDS ===
      description: (frontendApartment.description || "").trim(),
      photos_url: Array.isArray(frontendApartment.photos_url) ? frontendApartment.photos_url : Array.isArray(frontendApartment.images) ? frontendApartment.images : [],
      location_on_map: (frontendApartment.location_on_map || ((_a = frontendApartment.coordinates) == null ? void 0 : _a.url) || frontendApartment.mapUrl || "").trim(),
      facilities_amenities: (() => {
        if (typeof frontendApartment.facilities_amenities === "string") {
          return frontendApartment.facilities_amenities.trim();
        }
        if (Array.isArray(frontendApartment.facilities_amenities)) {
          return frontendApartment.facilities_amenities.join(", ").trim();
        }
        if (Array.isArray(frontendApartment.facilities)) {
          return frontendApartment.facilities.join(", ").trim();
        }
        if (Array.isArray(frontendApartment.amenities)) {
          return frontendApartment.amenities.join(", ").trim();
        }
        return "";
      })()
    };
    if (!transformed.description) delete transformed.description;
    if (!transformed.location_on_map) delete transformed.location_on_map;
    if (!transformed.facilities_amenities) delete transformed.facilities_amenities;
    if (transformed.photos_url.length === 0) delete transformed.photos_url;
    return transformed;
  };
  const fetchRentApartments = async (params = {}) => {
    try {
      dispatch(setLoading$2(true));
      const response = await rentApartmentsApi.getAll(params);
      const transformedApartments = response.map(transformRentApartmentFromApi);
      dispatch(setApartments(transformedApartments));
      return { success: true, apartments: transformedApartments };
    } catch (error2) {
      const errorMessage = handleApiError(error2, "Failed to fetch apartments");
      dispatch(setError$2(errorMessage));
      return { success: false, message: errorMessage };
    } finally {
      dispatch(setLoading$2(false));
    }
  };
  const createRentApartment = async (apartmentData) => {
    try {
      dispatch(setLoading$2(true));
      const apiData = transformRentApartmentToApi(apartmentData);
      const response = await rentApartmentsApi.create(apiData);
      const transformedApartment = transformRentApartmentFromApi(response);
      dispatch(addApartment(transformedApartment));
      return {
        success: true,
        message: "Apartment created successfully",
        apartment: transformedApartment
      };
    } catch (error2) {
      const errorMessage = handleApiError(error2, "Failed to create apartment");
      dispatch(setError$2(errorMessage));
      return { success: false, message: errorMessage };
    } finally {
      dispatch(setLoading$2(false));
    }
  };
  const updateRentApartment = async (apartmentId, updateData) => {
    try {
      dispatch(setLoading$2(true));
      const apiData = transformRentApartmentToApi(updateData);
      const response = await rentApartmentsApi.update(apartmentId, apiData);
      const transformedApartment = transformRentApartmentFromApi(response);
      dispatch(updateApartment(transformedApartment));
      return {
        success: true,
        message: "Apartment updated successfully",
        apartment: transformedApartment
      };
    } catch (error2) {
      const errorMessage = handleApiError(error2, "Failed to update apartment");
      dispatch(setError$2(errorMessage));
      return { success: false, message: errorMessage };
    } finally {
      dispatch(setLoading$2(false));
    }
  };
  const deleteRentApartment = async (apartmentId) => {
    try {
      dispatch(setLoading$2(true));
      await rentApartmentsApi.delete(apartmentId);
      dispatch(deleteApartment(apartmentId));
      return {
        success: true,
        message: "Apartment deleted successfully"
      };
    } catch (error2) {
      const errorMessage = handleApiError(error2, "Failed to delete apartment");
      dispatch(setError$2(errorMessage));
      return { success: false, message: errorMessage };
    } finally {
      dispatch(setLoading$2(false));
    }
  };
  const fetchStudiosForApartment = async (apartmentId) => {
    try {
      dispatch(setLoading$2(true));
      const response = await apartmentPartsApi.getAll({ apartment_id: apartmentId });
      const transformedStudios = response.map(transformStudioFromApi);
      const updatedApartments = apartments.map(
        (apt) => apt.id === apartmentId ? { ...apt, studios: transformedStudios } : apt
      );
      dispatch(setApartments(updatedApartments));
      return { success: true, studios: transformedStudios };
    } catch (error2) {
      const errorMessage = handleApiError(error2, "Failed to fetch studios");
      dispatch(setError$2(errorMessage));
      return { success: false, message: errorMessage };
    } finally {
      dispatch(setLoading$2(false));
    }
  };
  const createStudio = async (apartmentId, studioData) => {
    try {
      dispatch(setLoading$2(true));
      const apiData = transformStudioToApi(studioData);
      const response = await apartmentPartsApi.create(apartmentId, apiData);
      const transformedStudio = transformStudioFromApi(response);
      dispatch(addStudio({ apartmentId, studio: transformedStudio }));
      return {
        success: true,
        message: "Studio created successfully",
        studio: transformedStudio
      };
    } catch (error2) {
      const errorMessage = handleApiError(error2, "Failed to create studio");
      dispatch(setError$2(errorMessage));
      return { success: false, message: errorMessage };
    } finally {
      dispatch(setLoading$2(false));
    }
  };
  const updateStudio$1 = async (studioId, updateData) => {
    try {
      dispatch(setLoading$2(true));
      const apiData = transformStudioToApi(updateData);
      const response = await apartmentPartsApi.update(studioId, apiData);
      const transformedStudio = transformStudioFromApi(response);
      dispatch(updateStudio(transformedStudio));
      return {
        success: true,
        message: "Studio updated successfully",
        studio: transformedStudio
      };
    } catch (error2) {
      const errorMessage = handleApiError(error2, "Failed to update studio");
      dispatch(setError$2(errorMessage));
      return { success: false, message: errorMessage };
    } finally {
      dispatch(setLoading$2(false));
    }
  };
  const deleteStudio$1 = async (studioId) => {
    try {
      dispatch(setLoading$2(true));
      await apartmentPartsApi.delete(studioId);
      dispatch(deleteStudio(studioId));
      return {
        success: true,
        message: "Studio deleted successfully"
      };
    } catch (error2) {
      const errorMessage = handleApiError(error2, "Failed to delete studio");
      dispatch(setError$2(errorMessage));
      return { success: false, message: errorMessage };
    } finally {
      dispatch(setLoading$2(false));
    }
  };
  const toggleStudioAvailability$1 = async (studioId, isAvailable) => {
    try {
      dispatch(setLoading$2(true));
      const response = await apartmentPartsApi.update(studioId, { is_available: !isAvailable });
      const transformedStudio = transformStudioFromApi(response);
      dispatch(toggleStudioAvailability({ studioId }));
      return {
        success: true,
        message: `Studio ${!isAvailable ? "made available" : "marked as occupied"}`,
        studio: transformedStudio
      };
    } catch (error2) {
      const errorMessage = handleApiError(error2, "Failed to update studio availability");
      dispatch(setError$2(errorMessage));
      return { success: false, message: errorMessage };
    } finally {
      dispatch(setLoading$2(false));
    }
  };
  const fetchSaleApartments = async (params = {}) => {
    try {
      dispatch(setLoading$2(true));
      const response = await saleApartmentsApi.getAll(params);
      const transformedApartments = response.map(transformSaleApartmentFromApi);
      dispatch(setSaleApartments(transformedApartments));
      return { success: true, apartments: transformedApartments };
    } catch (error2) {
      const errorMessage = handleApiError(error2, "Failed to fetch sale apartments");
      dispatch(setError$2(errorMessage));
      return { success: false, message: errorMessage };
    } finally {
      dispatch(setLoading$2(false));
    }
  };
  const createSaleApartment = async (apartmentData) => {
    try {
      dispatch(setLoading$2(true));
      const apiData = transformSaleApartmentToApi(apartmentData);
      const response = await saleApartmentsApi.create(apiData);
      const transformedApartment = transformSaleApartmentFromApi(response);
      dispatch(addSaleApartment(transformedApartment));
      return {
        success: true,
        message: "Sale apartment created successfully",
        apartment: transformedApartment
      };
    } catch (error2) {
      const errorMessage = handleApiError(error2, "Failed to create sale apartment");
      dispatch(setError$2(errorMessage));
      return { success: false, message: errorMessage };
    } finally {
      dispatch(setLoading$2(false));
    }
  };
  const updateSaleApartment$1 = async (apartmentId, updateData) => {
    try {
      dispatch(setLoading$2(true));
      const apiData = transformSaleApartmentToApi(updateData);
      const response = await saleApartmentsApi.update(apartmentId, apiData);
      const transformedApartment = transformSaleApartmentFromApi(response);
      dispatch(updateSaleApartment(transformedApartment));
      return {
        success: true,
        message: "Sale apartment updated successfully",
        apartment: transformedApartment
      };
    } catch (error2) {
      const errorMessage = handleApiError(error2, "Failed to update sale apartment");
      dispatch(setError$2(errorMessage));
      return { success: false, message: errorMessage };
    } finally {
      dispatch(setLoading$2(false));
    }
  };
  const deleteSaleApartment$1 = async (apartmentId) => {
    try {
      dispatch(setLoading$2(true));
      const response = await saleApartmentsApi.delete(apartmentId);
      dispatch(deleteSaleApartment(apartmentId));
      return {
        success: true,
        message: "Sale apartment deleted successfully"
      };
    } catch (error2) {
      const errorMessage = handleApiError(error2, "Failed to delete sale apartment");
      dispatch(setError$2(errorMessage));
      return { success: false, message: errorMessage };
    } finally {
      dispatch(setLoading$2(false));
    }
  };
  const fetchMyContent = async (params = {}) => {
    var _a, _b;
    try {
      dispatch(setLoading$2(true));
      const response = await myContentApi.getMyContent(params);
      const transformedRentApartments = ((_a = response.rent_apartments) == null ? void 0 : _a.map(transformRentApartmentFromApi)) || [];
      const transformedSaleApartments = ((_b = response.sale_apartments) == null ? void 0 : _b.map(transformSaleApartmentFromApi)) || [];
      dispatch(setApartments(transformedRentApartments));
      dispatch(setSaleApartments(transformedSaleApartments));
      return {
        success: true,
        rentApartments: transformedRentApartments,
        saleApartments: transformedSaleApartments
      };
    } catch (error2) {
      const errorMessage = handleApiError(error2, "Failed to fetch your content");
      dispatch(setError$2(errorMessage));
      return { success: false, message: errorMessage };
    } finally {
      dispatch(setLoading$2(false));
    }
  };
  const clearPropertyError = () => {
    dispatch(clearError$2());
  };
  const fetchApartmentsByCreatorFromApi = async (createdBy) => {
    try {
      const response = await rentApartmentsApi.getAll({ created_by: createdBy });
      return response.map(transformRentApartmentFromApi);
    } catch (error2) {
      return [];
    }
  };
  const fetchStudiosByCreatorFromApi = async (createdBy) => {
    try {
      const response = await apartmentPartsApi.getAll({ created_by: createdBy });
      return response.map(transformStudioFromApi);
    } catch (error2) {
      return [];
    }
  };
  const fetchSaleApartmentsByCreatorFromApi = async (createdBy) => {
    try {
      const response = await saleApartmentsApi.getAll({ created_by: createdBy });
      return response.map(transformSaleApartmentFromApi);
    } catch (error2) {
      return [];
    }
  };
  return {
    // State
    property,
    apartments,
    saleApartments,
    isLoading,
    error,
    // Rent Apartments
    fetchRentApartments,
    createRentApartment,
    updateRentApartment,
    deleteRentApartment,
    // Studios/Apartment Parts
    fetchStudiosForApartment,
    createStudio,
    updateStudio: updateStudio$1,
    deleteStudio: deleteStudio$1,
    toggleStudioAvailability: toggleStudioAvailability$1,
    // Sale Apartments
    fetchSaleApartments,
    createSaleApartment,
    updateSaleApartment: updateSaleApartment$1,
    deleteSaleApartment: deleteSaleApartment$1,
    // My Content
    fetchMyContent,
    // Utilities
    clearError: clearPropertyError,
    // Sync selectors (work with already loaded Redux data)
    getApartmentsByCreator: (createdBy) => apartments.filter(
      (apt) => apt.createdBy === createdBy || apt.listed_by_admin_id === createdBy
    ),
    getSaleApartmentsByCreator: (createdBy) => saleApartments.filter(
      (apt) => apt.createdBy === createdBy || apt.listed_by_admin_id === createdBy
    ),
    getStudiosByCreator: (createdBy) => {
      return apartments.filter((apt) => apt.createdBy === createdBy || apt.listed_by_admin_id === createdBy).flatMap((apt) => apt.studios || []);
    },
    getAllAvailableStudios: () => {
      return apartments.flatMap((apt) => apt.studios || []).filter((studio) => studio.isAvailable);
    },
    getAllStudios: () => {
      return apartments.flatMap((apt) => apt.studios || []);
    },
    getAllAvailableSaleApartments: () => {
      return saleApartments.filter((apt) => apt.isAvailable !== false);
    },
    // API-based fetch functions (use these to refresh data from backend)
    fetchApartmentsByCreatorFromApi,
    fetchStudiosByCreatorFromApi,
    fetchSaleApartmentsByCreatorFromApi,
    // Legacy compatibility
    addApartment: createRentApartment,
    addStudio: createStudio,
    addSaleApartment: createSaleApartment,
    // Additional legacy methods that might be needed
    verifyDataConsistency: () => ({ success: true, message: "Data is consistent with API" }),
    clearAllData: () => {
      dispatch(setApartments([]));
      dispatch(setSaleApartments([]));
    }
  };
};
const StudioMiniCard = ({
  studio,
  apartmentId
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { updateStudio: updateStudio2, deleteStudio: deleteStudio2 } = usePropertyManagement();
  const { showSuccess, showError } = useToast();
  const handleDelete = async () => {
    const result = await deleteStudio2(studio.id);
    if (result && result.success) {
      showSuccess("Studio deleted successfully!");
      window.location.reload();
    } else {
      const errorMsg = (result == null ? void 0 : result.message) || (result == null ? void 0 : result.error) || "Unknown error occurred";
      showError(`Failed to delete studio: ${errorMsg}`);
    }
    setShowDeleteConfirm(false);
  };
  const toggleAvailability = () => {
    const updatedStudio = {
      ...studio,
      isAvailable: !studio.isAvailable
    };
    updateStudio2(apartmentId, updatedStudio);
  };
  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };
  const handleToggleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleAvailability();
  };
  const handleCloseDelete = () => {
    setShowDeleteConfirm(false);
  };
  const handleCardClick = () => {
    let navigationSource = "customer-studios";
    if (location.pathname.includes("/admin/dashboard")) {
      navigationSource = "admin-dashboard";
    } else if (location.pathname.includes("/master-admin/dashboard")) {
      navigationSource = "master-admin-dashboard";
    }
    navigate(`/studio/${studio.id}?source=${navigationSource}`);
  };
  return /* @__PURE__ */ jsxs("div", { className: `studio-mini-card ${!studio.isAvailable ? "occupied" : ""}`, children: [
    /* @__PURE__ */ jsx("div", { className: "studio-mini-header", onClick: handleCardClick, style: { cursor: "pointer" }, children: /* @__PURE__ */ jsx(
      "div",
      {
        className: "studio-mini-image",
        style: { backgroundImage: `url(${studio.images[0]})` },
        children: /* @__PURE__ */ jsx("div", { className: "studio-status-badge", children: /* @__PURE__ */ jsx("span", { className: `status-indicator ${studio.isAvailable ? "available" : "occupied"}`, children: studio.isAvailable ? "Available" : "Occupied" }) })
      }
    ) }),
    /* @__PURE__ */ jsxs("div", { className: "studio-mini-content", onClick: handleCardClick, style: { cursor: "pointer" }, children: [
      /* @__PURE__ */ jsx("h4", { className: "studio-mini-title", children: studio.title }),
      /* @__PURE__ */ jsxs("div", { className: "studio-mini-details", children: [
        /* @__PURE__ */ jsx("span", { className: "studio-unit", children: studio.unitNumber }),
        /* @__PURE__ */ jsx("span", { className: "studio-floor", children: studio.floor }),
        /* @__PURE__ */ jsx("span", { className: "studio-area", children: studio.area })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "studio-price", children: studio.price })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "studio-mini-actions", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          className: `action-btn toggle-btn ${studio.isAvailable ? "make-occupied" : "make-available"}`,
          onClick: handleToggleClick,
          title: studio.isAvailable ? "Mark as Occupied" : "Mark as Available",
          children: /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: studio.isAvailable ? faLockOpen : faLock })
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          className: "action-btn delete-btn",
          onClick: handleDeleteClick,
          title: "Delete Studio",
          children: /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faTrash })
        }
      )
    ] }),
    showDeleteConfirm && /* @__PURE__ */ jsx("div", { className: "delete-confirm-overlay", onClick: handleCloseDelete, children: /* @__PURE__ */ jsxs("div", { className: "delete-confirm-dialog", onClick: (e) => e.stopPropagation(), children: [
      /* @__PURE__ */ jsx("h4", { children: "Delete Studio?" }),
      /* @__PURE__ */ jsxs("p", { children: [
        'Are you sure you want to delete "',
        studio.title,
        '"?'
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "delete-confirm-actions", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "confirm-cancel-btn",
            onClick: handleCloseDelete,
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "confirm-delete-btn",
            onClick: handleDelete,
            children: "Delete"
          }
        )
      ] })
    ] }) })
  ] });
};
var define_process_env_default$1 = { REACT_APP_API_BASE_URL: "http://localhost:8000/api/v1", REACT_APP_TOKEN_STORAGE_KEY: "api_access_token" };
const resolveUploadApiBaseUrl = () => {
  const configuredBaseUrl = define_process_env_default$1.REACT_APP_API_BASE_URL.trim();
  if (!configuredBaseUrl) {
    return "/api/v1";
  }
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    if (configuredBaseUrl.startsWith("http://localhost:8000") || configuredBaseUrl.startsWith("http://127.0.0.1:8000")) {
      return "http://127.0.0.1:8000/api/v1";
    }
  }
  return configuredBaseUrl.replace(/\/$/, "");
};
const API_BASE_URL = resolveUploadApiBaseUrl();
const getAuthToken = () => {
  const tokenKey = define_process_env_default$1.REACT_APP_TOKEN_STORAGE_KEY;
  return localStorage.getItem(tokenKey);
};
const uploadPhotos = async (entityId, entityType, files, documentType = null) => {
  if (!entityId || !entityType || !files || files.length === 0) {
    throw new Error("Missing required parameters: entityId, entityType, and files are required");
  }
  const validEntityTypes = ["part", "rent", "sale", "rental_contract"];
  if (!validEntityTypes.includes(entityType)) {
    throw new Error(`Invalid entity_type: ${entityType}. Must be one of: ${validEntityTypes.join(", ")}`);
  }
  if (entityType === "rental_contract") {
    if (!documentType) {
      throw new Error('document_type is required for rental_contract. Must be "contract" or "customer_id"');
    }
    if (!["contract", "customer_id"].includes(documentType)) {
      throw new Error(`Invalid document_type: ${documentType}. Must be "contract" or "customer_id"`);
    }
  }
  const token = getAuthToken();
  if (!token) {
    throw new Error("Authentication required. Please log in.");
  }
  const formData = new FormData();
  formData.append("entity_id", entityId.toString());
  formData.append("entity_type", entityType);
  if (documentType) {
    formData.append("document_type", documentType);
  }
  files.forEach((file) => {
    formData.append("files", file);
  });
  try {
    const response = await fetch(`${API_BASE_URL}/uploads/photos`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
        // NOTE: Do NOT set Content-Type for FormData - browser sets it automatically with boundary
      },
      body: formData
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: "Upload failed" }));
      throw new Error(errorData.detail || `Upload failed with status ${response.status}`);
    }
    const result = await response.json();
    return {
      success: true,
      data: result,
      files: result.files || [],
      count: result.count || 0,
      entityId: result.entity_id,
      entityType: result.entity_type
    };
  } catch (error) {
    console.error("❌ Photo upload error:", error);
    throw new Error(
      error.message || "Failed to upload photos. Please check your connection and try again."
    );
  }
};
const uploadRentalApartmentPhotos = async (apartmentId, files) => {
  return uploadPhotos(apartmentId, "rent", files);
};
const uploadSaleApartmentPhotos = async (apartmentId, files) => {
  return uploadPhotos(apartmentId, "sale", files);
};
const uploadStudioPhotos = async (partId, files) => {
  return uploadPhotos(partId, "part", files);
};
const validateFile = (file, maxSizeMB = 10) => {
  if (!file) {
    return { valid: false, error: "No file provided" };
  }
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size (${maxSizeMB}MB)`
    };
  }
  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "application/pdf"];
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type: ${file.type}. Allowed types: JPEG, PNG, GIF, WEBP, PDF`
    };
  }
  return { valid: true };
};
const validateFiles = (files, maxSizeMB = 10) => {
  const errors = [];
  if (!files || files.length === 0) {
    return { valid: false, errors: ["No files provided"] };
  }
  files.forEach((file, index) => {
    const result = validateFile(file, maxSizeMB);
    if (!result.valid) {
      errors.push(`File ${index + 1} (${file.name}): ${result.error}`);
    }
  });
  return {
    valid: errors.length === 0,
    errors
  };
};
const AddStudioModal = ({ isOpen, apartmentId, onStudioAdded, onClose }) => {
  const [formData, setFormData] = useState({
    title: "",
    area: "",
    monthly_price: "",
    bedrooms: 1,
    bathrooms: "private",
    furnished: "yes",
    balcony: "no",
    description: "",
    photoFiles: []
    // Store actual File objects
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
  if (!isOpen || !apartmentId) return null;
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    setFormData((prev) => ({
      ...prev,
      [name]: newValue
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ""
      }));
    }
  };
  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setIsUploadingPhotos(true);
    try {
      const validation = validateFiles(files, 10);
      if (!validation.valid) {
        setErrors((prev) => ({
          ...prev,
          photos_url: validation.errors.join("; ")
        }));
        setIsUploadingPhotos(false);
        return;
      }
      setFormData((prev) => ({
        ...prev,
        photoFiles: [...prev.photoFiles, ...files]
      }));
      if (errors.photos_url) {
        setErrors((prev) => ({
          ...prev,
          photos_url: ""
        }));
      }
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        photos_url: "Error uploading photos. Please try again."
      }));
    } finally {
      setIsUploadingPhotos(false);
    }
  };
  const removePhoto = (index) => {
    setFormData((prev) => ({
      ...prev,
      photoFiles: prev.photoFiles.filter((_, i) => i !== index)
    }));
  };
  const validateForm = () => {
    const newErrors = {};
    if (!formData.title || !formData.title.trim()) {
      newErrors.title = "Studio title is required";
    }
    if (!formData.area || !formData.area.toString().trim()) {
      newErrors.area = "Area is required";
    } else if (isNaN(parseFloat(formData.area)) || parseFloat(formData.area) <= 0) {
      newErrors.area = "Area must be a positive number";
    }
    if (!formData.monthly_price || !formData.monthly_price.toString().trim()) {
      newErrors.monthly_price = "Monthly price is required";
    } else if (isNaN(parseFloat(formData.monthly_price)) || parseFloat(formData.monthly_price) < 0) {
      newErrors.monthly_price = "Monthly price must be a valid number";
    }
    if (!formData.description || !formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    if (!["private", "shared"].includes(formData.bathrooms)) {
      newErrors.bathrooms = "Bathroom type must be private or shared";
    }
    if (!["yes", "no"].includes(formData.furnished)) {
      newErrors.furnished = "Furnished status must be yes or no";
    }
    if (!["yes", "shared", "no"].includes(formData.balcony)) {
      newErrors.balcony = "Balcony type must be yes, shared, or no";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e) => {
    var _a, _b, _c, _d;
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setIsSubmitting(true);
    try {
      if (!((_a = formData.title) == null ? void 0 : _a.trim()) || !formData.area || !formData.monthly_price) {
        throw new Error(`Missing required studio data: title=${formData.title}, area=${formData.area}, monthly_price=${formData.monthly_price}`);
      }
      const apiData = {
        title: ((_b = formData.title) == null ? void 0 : _b.trim()) || "Unnamed Studio",
        // REQUIRED - never empty
        area: formData.area && formData.area.toString().trim() || "25",
        // REQUIRED - never empty, default 25 sqm
        monthly_price: formData.monthly_price && formData.monthly_price.toString().trim() || "0",
        // REQUIRED - never empty
        bedrooms: parseInt(formData.bedrooms) || 1,
        // REQUIRED - always valid integer
        bathrooms: ["private", "shared"].includes(formData.bathrooms) ? formData.bathrooms : "private",
        // REQUIRED - validated enum
        furnished: ["yes", "no"].includes(formData.furnished) ? formData.furnished : "yes",
        // REQUIRED - validated enum
        balcony: ["yes", "shared", "no"].includes(formData.balcony) ? formData.balcony : "no",
        // REQUIRED - validated enum
        description: ((_c = formData.description) == null ? void 0 : _c.trim()) || "No description provided",
        // Optional
        photos_url: []
        // Empty array - photos uploaded separately via /api/v1/uploads/photos
      };
      const createdStudio = await apartmentPartsApi.create(apartmentId, apiData);
      if (formData.photoFiles && formData.photoFiles.length > 0) {
        try {
          const uploadResult = await uploadStudioPhotos(
            createdStudio.id,
            formData.photoFiles
          );
          if (uploadResult.files && uploadResult.files.length > 0) {
            createdStudio.photos_url = uploadResult.files.map((f) => f.url);
          }
        } catch (uploadError) {
          console.error("⚠️ Photo upload failed:", uploadError);
          setErrors({
            general: `Studio created successfully, but photo upload failed: ${uploadError.message}`
          });
        }
      }
      if (onStudioAdded) {
        onStudioAdded(createdStudio);
      }
      onClose();
      setFormData({
        title: "",
        area: "",
        monthly_price: "",
        bedrooms: 1,
        bathrooms: "private",
        furnished: "yes",
        balcony: "no",
        description: "",
        photoFiles: []
      });
      setErrors({});
    } catch (error) {
      let errorMessage = "Failed to create studio";
      if (error.message === "Network error" || ((_d = error.message) == null ? void 0 : _d.includes("CORS"))) {
        errorMessage = "⚠️ Backend Connection Error: The backend server is not responding or CORS is not configured. Please ensure the backend is running at http://localhost:8000 and CORS allows requests from http://localhost:3000";
      } else if (error.status === 500) {
        errorMessage = "⚠️ Backend Server Error: The backend encountered an internal error. Check backend console logs for details.";
      } else {
        errorMessage = handleApiError(error, "Failed to create studio");
      }
      setErrors({ general: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "modal-overlay", children: /* @__PURE__ */ jsxs("div", { className: "add-studio-modal", children: [
    /* @__PURE__ */ jsxs("div", { className: "modal-header", children: [
      /* @__PURE__ */ jsx("h2", { children: "Add New Studio" }),
      /* @__PURE__ */ jsx("button", { className: "close-btn", onClick: onClose, children: "×" })
    ] }),
    /* @__PURE__ */ jsxs("form", { className: "studio-form", onSubmit: handleSubmit, children: [
      errors.general && /* @__PURE__ */ jsx("div", { className: "error-message general-error", children: errors.general }),
      /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "title", children: "Studio Title *" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            id: "title",
            name: "title",
            value: formData.title,
            onChange: handleInputChange,
            className: errors.title ? "error" : "",
            placeholder: "Modern Studio - Unit A-201"
          }
        ),
        errors.title && /* @__PURE__ */ jsx("span", { className: "error-text", children: errors.title })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "form-row", children: [
        /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "area", children: "Area (sqm) *" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              id: "area",
              name: "area",
              value: formData.area,
              onChange: handleInputChange,
              className: errors.area ? "error" : "",
              placeholder: "e.g., 45.5 (REQUIRED)",
              min: "1",
              step: "0.1",
              required: true
            }
          ),
          errors.area && /* @__PURE__ */ jsx("span", { className: "error-text", children: errors.area })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "monthly_price", children: "Monthly Price (EGP) *" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              id: "monthly_price",
              name: "monthly_price",
              value: formData.monthly_price,
              onChange: handleInputChange,
              className: errors.monthly_price ? "error" : "",
              placeholder: "e.g., 3500.00 (REQUIRED)",
              min: "0",
              step: "0.01",
              required: true
            }
          ),
          errors.monthly_price && /* @__PURE__ */ jsx("span", { className: "error-text", children: errors.monthly_price })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "form-row", children: [
        /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "bedrooms", children: "Bedrooms" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              id: "bedrooms",
              name: "bedrooms",
              value: formData.bedrooms,
              onChange: handleInputChange,
              min: "1",
              placeholder: "1"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "bathrooms", children: "Bathrooms" }),
          /* @__PURE__ */ jsx(
            "select",
            {
              id: "bathrooms",
              name: "bathrooms",
              value: formData.bathrooms,
              onChange: handleInputChange,
              children: getValidOptions.bathroomTypes().map((option) => /* @__PURE__ */ jsx("option", { value: option.value, children: option.label }, option.value))
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "form-row", children: [
        /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "furnished", children: "Furnished" }),
          /* @__PURE__ */ jsx(
            "select",
            {
              id: "furnished",
              name: "furnished",
              value: formData.furnished,
              onChange: handleInputChange,
              children: getValidOptions.furnishedStatus().map((option) => /* @__PURE__ */ jsx("option", { value: option.value, children: option.label }, option.value))
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "balcony", children: "Balcony" }),
          /* @__PURE__ */ jsx(
            "select",
            {
              id: "balcony",
              name: "balcony",
              value: formData.balcony,
              onChange: handleInputChange,
              children: getValidOptions.balconyTypes().map((option) => /* @__PURE__ */ jsx("option", { value: option.value, children: option.label }, option.value))
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "form-group full-width", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "description", children: "Description *" }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            id: "description",
            name: "description",
            value: formData.description,
            onChange: handleInputChange,
            className: errors.description ? "error" : "",
            placeholder: "Cozy studio apartment with modern amenities...",
            rows: "4"
          }
        ),
        errors.description && /* @__PURE__ */ jsx("span", { className: "error-text", children: errors.description })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "form-group full-width", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "photos", children: "Studio Photos (Optional)" }),
        /* @__PURE__ */ jsxs("div", { className: "photo-upload-container", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "file",
              id: "photos",
              name: "photos",
              multiple: true,
              accept: "image/*",
              onChange: handlePhotoUpload,
              className: "photo-upload-input",
              disabled: isUploadingPhotos
            }
          ),
          /* @__PURE__ */ jsx("label", { htmlFor: "photos", className: `photo-upload-label ${isUploadingPhotos ? "uploading" : ""}`, children: isUploadingPhotos ? /* @__PURE__ */ jsx("div", { className: "upload-loading", children: /* @__PURE__ */ jsx(LoadingSpinner, { size: "small", color: "primary", inline: true }) }) : /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("div", { className: "upload-icon", children: "📸" }),
            /* @__PURE__ */ jsxs("div", { className: "upload-text", children: [
              /* @__PURE__ */ jsx("strong", { children: "Click to upload photos (optional)" }),
              /* @__PURE__ */ jsx("span", { children: "or drag and drop" })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "upload-hint", children: "PNG, JPG, GIF up to 10MB each" })
          ] }) })
        ] }),
        errors.photos_url && /* @__PURE__ */ jsx("span", { className: "error-text", children: errors.photos_url }),
        formData.photoFiles.length > 0 && /* @__PURE__ */ jsx("div", { className: "photo-preview-grid", children: formData.photoFiles.map((file, index) => /* @__PURE__ */ jsxs("div", { className: "photo-preview-item", children: [
          /* @__PURE__ */ jsx(
            "img",
            {
              src: URL.createObjectURL(file),
              alt: `Studio ${index + 1}`,
              className: "photo-preview-image"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: "photo-remove-btn",
              onClick: () => removePhoto(index),
              title: "Remove photo",
              children: "×"
            }
          )
        ] }, index)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "modal-actions", children: [
        /* @__PURE__ */ jsx("button", { type: "button", className: "cancel-btn", onClick: onClose, disabled: isSubmitting, children: "Cancel" }),
        /* @__PURE__ */ jsx("button", { type: "submit", className: "submit-btn", disabled: isSubmitting || isUploadingPhotos, children: isSubmitting ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(LoadingSpinner, { size: "small", color: "white", inline: true }),
          "Adding Studio..."
        ] }) : "Add Studio" })
      ] })
    ] })
  ] }) });
};
const ApartmentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [apartment, setApartment] = useState(null);
  const [studios, setStudios] = useState([]);
  const [loading, setLoading2] = useState(true);
  const [error, setError2] = useState(null);
  const [isAddStudioModalOpen, setIsAddStudioModalOpen] = useState(false);
  const [navigationSource, setNavigationSource] = useState("admin-dashboard");
  useEffect(() => {
    const source = searchParams.get("source");
    if (source) {
      setNavigationSource(source);
    }
  }, [searchParams]);
  useEffect(() => {
    const fetchApartmentData = async () => {
      setLoading2(true);
      setError2(null);
      try {
        const apartmentResponse = await rentApartmentsApi.getById(id);
        if (apartmentResponse) {
          setApartment(apartmentResponse);
          const studiosResponse = await apartmentPartsApi.getAll({ apartment_id: id });
          if (studiosResponse && Array.isArray(studiosResponse)) {
            setStudios(studiosResponse);
          } else {
            setStudios([]);
          }
        } else {
          setError2("Apartment not found");
        }
      } catch (err) {
        setError2("Failed to load apartment details");
      } finally {
        setLoading2(false);
      }
    };
    if (id) {
      fetchApartmentData();
    }
  }, [id]);
  const handleStudioAdded = async () => {
    try {
      const studiosResponse = await apartmentPartsApi.getAll({ apartment_id: id });
      if (studiosResponse && Array.isArray(studiosResponse)) {
        setStudios(studiosResponse);
      }
      setIsAddStudioModalOpen(false);
    } catch (err) {
    }
  };
  const getBackLink = () => {
    if (navigationSource === "master-admin-dashboard") {
      return "/master-admin/dashboard";
    }
    return "/admin/dashboard";
  };
  const availableStudios = studios.filter((studio) => studio.status === "available").length;
  const occupiedStudios = studios.length - availableStudios;
  if (loading) {
    return /* @__PURE__ */ jsx(LoadingSpinner, {});
  }
  if (error) {
    return /* @__PURE__ */ jsx("div", { className: "apartment-detail-page error-state", children: /* @__PURE__ */ jsxs("div", { className: "error-container", children: [
      /* @__PURE__ */ jsx("h2", { children: "Error" }),
      /* @__PURE__ */ jsx("p", { children: error }),
      /* @__PURE__ */ jsx(BackButton, { text: "← Go Back", onClick: () => navigate(getBackLink()) })
    ] }) });
  }
  if (!apartment) {
    return /* @__PURE__ */ jsx("div", { className: "apartment-detail-page error-state", children: /* @__PURE__ */ jsxs("div", { className: "error-container", children: [
      /* @__PURE__ */ jsx("h2", { children: "Apartment Not Found" }),
      /* @__PURE__ */ jsx("p", { children: "The apartment you're looking for doesn't exist." }),
      /* @__PURE__ */ jsx(BackButton, { text: "← Go Back", onClick: () => navigate(getBackLink()) })
    ] }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "apartment-detail-page", children: [
    /* @__PURE__ */ jsxs("div", { className: "apartment-detail-container", children: [
      /* @__PURE__ */ jsx(BackButton, { text: "← Back to Dashboard", onClick: () => navigate(getBackLink()) }),
      /* @__PURE__ */ jsxs("div", { className: "apartment-detail-header", children: [
        /* @__PURE__ */ jsxs("div", { className: "apartment-header-content", children: [
          /* @__PURE__ */ jsxs("div", { className: "apartment-main-info", children: [
            /* @__PURE__ */ jsx("h1", { className: "apartment-name", children: apartment.name }),
            /* @__PURE__ */ jsxs("p", { className: "apartment-location", children: [
              "📍 ",
              apartment.location
            ] }),
            /* @__PURE__ */ jsx("p", { className: "apartment-address", children: apartment.address })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "apartment-stats-summary", children: [
            /* @__PURE__ */ jsxs("div", { className: "stat-box", children: [
              /* @__PURE__ */ jsx("span", { className: "stat-number", children: studios.length }),
              /* @__PURE__ */ jsx("span", { className: "stat-label", children: "Total Studios" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "stat-box available", children: [
              /* @__PURE__ */ jsx("span", { className: "stat-number", children: availableStudios }),
              /* @__PURE__ */ jsx("span", { className: "stat-label", children: "Available" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "stat-box occupied", children: [
              /* @__PURE__ */ jsx("span", { className: "stat-number", children: occupiedStudios }),
              /* @__PURE__ */ jsx("span", { className: "stat-label", children: "Occupied" })
            ] })
          ] })
        ] }),
        apartment.photos_url && apartment.photos_url.length > 0 && /* @__PURE__ */ jsx("div", { className: "apartment-images-gallery", children: apartment.photos_url.slice(0, 3).map((photo, index) => /* @__PURE__ */ jsx(
          "div",
          {
            className: "apartment-image-item",
            style: { backgroundImage: `url(${photo})` }
          },
          index
        )) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "apartment-details-section", children: [
        /* @__PURE__ */ jsx("h2", { children: "Apartment Details" }),
        /* @__PURE__ */ jsxs("div", { className: "details-grid", children: [
          /* @__PURE__ */ jsxs("div", { className: "detail-item", children: [
            /* @__PURE__ */ jsx("span", { className: "detail-label", children: "Area:" }),
            /* @__PURE__ */ jsxs("span", { className: "detail-value", children: [
              apartment.area,
              " m²"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "detail-item", children: [
            /* @__PURE__ */ jsx("span", { className: "detail-label", children: "Bedrooms:" }),
            /* @__PURE__ */ jsx("span", { className: "detail-value", children: apartment.bedrooms })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "detail-item", children: [
            /* @__PURE__ */ jsx("span", { className: "detail-label", children: "Bathrooms:" }),
            /* @__PURE__ */ jsx("span", { className: "detail-value", children: apartment.bathrooms })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "detail-item", children: [
            /* @__PURE__ */ jsx("span", { className: "detail-label", children: "Floor:" }),
            /* @__PURE__ */ jsx("span", { className: "detail-value", children: apartment.floor })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "detail-item", children: [
            /* @__PURE__ */ jsx("span", { className: "detail-label", children: "Price:" }),
            /* @__PURE__ */ jsxs("span", { className: "detail-value", children: [
              apartment.price,
              " EGP"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "detail-item", children: [
            /* @__PURE__ */ jsx("span", { className: "detail-label", children: "Contact:" }),
            /* @__PURE__ */ jsx("span", { className: "detail-value", children: apartment.contact_number })
          ] })
        ] }),
        apartment.description && /* @__PURE__ */ jsxs("div", { className: "apartment-description", children: [
          /* @__PURE__ */ jsx("h3", { children: "Description" }),
          /* @__PURE__ */ jsx("p", { children: apartment.description })
        ] }),
        apartment.facilities_amenities && /* @__PURE__ */ jsxs("div", { className: "apartment-facilities", children: [
          /* @__PURE__ */ jsx("h3", { children: "Facilities & Amenities" }),
          /* @__PURE__ */ jsx("div", { className: "facilities-list", children: (() => {
            const facilities = typeof apartment.facilities_amenities === "string" ? apartment.facilities_amenities.split(",").map((f) => f.trim()).filter((f) => f.length > 0) : Array.isArray(apartment.facilities_amenities) ? apartment.facilities_amenities : [];
            return facilities.map((facility, index) => /* @__PURE__ */ jsx("span", { className: "facility-tag", children: facility }, index));
          })() })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "studios-section", children: [
        /* @__PURE__ */ jsxs("div", { className: "studios-header", children: [
          /* @__PURE__ */ jsxs("h2", { children: [
            "Studios (",
            studios.length,
            ")"
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              className: "add-studio-btn-primary",
              onClick: () => setIsAddStudioModalOpen(true),
              children: "+ Add New Studio"
            }
          )
        ] }),
        studios.length > 0 ? /* @__PURE__ */ jsx("div", { className: "studios-grid", children: studios.map((studio) => /* @__PURE__ */ jsx(
          StudioMiniCard,
          {
            studio: {
              id: studio.id,
              title: `Studio ${studio.studio_number}`,
              unitNumber: `Unit #${studio.studio_number}`,
              floor: `Floor ${apartment.floor}`,
              area: `${apartment.area} m²`,
              price: `${studio.rent_value} EGP/month`,
              images: apartment.photos_url || ["/api/placeholder/400/300"],
              isAvailable: studio.status === "available",
              apartmentId: apartment.id
            },
            apartmentId: apartment.id
          },
          studio.id
        )) }) : /* @__PURE__ */ jsx("div", { className: "no-studios-message", children: /* @__PURE__ */ jsxs("div", { className: "no-studios-content", children: [
          /* @__PURE__ */ jsx("span", { className: "no-studios-icon", children: "🏠" }),
          /* @__PURE__ */ jsx("h3", { children: "No Studios Yet" }),
          /* @__PURE__ */ jsx("p", { children: "This apartment doesn't have any studios yet. Add your first studio to get started." }),
          /* @__PURE__ */ jsx(
            "button",
            {
              className: "add-first-studio-btn",
              onClick: () => setIsAddStudioModalOpen(true),
              children: "+ Add First Studio"
            }
          )
        ] }) })
      ] })
    ] }),
    isAddStudioModalOpen && /* @__PURE__ */ jsx(
      AddStudioModal,
      {
        isOpen: isAddStudioModalOpen,
        onClose: () => setIsAddStudioModalOpen(false),
        onStudioAdded: handleStudioAdded,
        apartmentId: apartment.id
      }
    )
  ] });
};
const AdminLanding = () => {
  return /* @__PURE__ */ jsxs("main", { className: "admin-landing", children: [
    /* @__PURE__ */ jsxs(
      "section",
      {
        className: "admin-hero",
        style: { backgroundImage: `url(${heroImg})` },
        "aria-label": "AYG — Admin Portal",
        children: [
          /* @__PURE__ */ jsx("div", { className: "admin-hero__overlay" }),
          /* @__PURE__ */ jsx("nav", { className: "admin-landing__nav", children: /* @__PURE__ */ jsxs("div", { className: "brand", children: [
            /* @__PURE__ */ jsx("img", { src: aygLogo, alt: "AYG Logo", className: "brand-logo" }),
            /* @__PURE__ */ jsx("span", { className: "brand-text", children: "AYG" })
          ] }) }),
          /* @__PURE__ */ jsxs("div", { className: "admin-landing__container", children: [
            /* @__PURE__ */ jsxs("div", { className: "admin-landing__header", children: [
              /* @__PURE__ */ jsxs("h1", { children: [
                "Welcome to the ",
                /* @__PURE__ */ jsx("span", { className: "admin-accent", children: "Admin Panel" })
              ] }),
              /* @__PURE__ */ jsx("p", { children: "Choose your access level to manage properties, users, and system operations with secure authentication and comprehensive dashboard tools." })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "admin-options", children: [
              /* @__PURE__ */ jsxs("div", { className: "admin-option-card", children: [
                /* @__PURE__ */ jsx("div", { className: "admin-option-icon", children: "👨‍💼" }),
                /* @__PURE__ */ jsx("h2", { children: "Admin Login" }),
                /* @__PURE__ */ jsx("p", { children: "Access the admin dashboard to manage your properties, handle rental applications, and communicate with customers." }),
                /* @__PURE__ */ jsx(Link, { to: "/admin/login", className: "admin-option-btn admin-btn", children: "Login as Admin" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "admin-option-card", children: [
                /* @__PURE__ */ jsx("div", { className: "admin-option-icon", children: "🔐" }),
                /* @__PURE__ */ jsx("h2", { children: "Master Admin" }),
                /* @__PURE__ */ jsx("p", { children: "Full system access for master administrators to manage all users, properties, system settings, and advanced configurations." }),
                /* @__PURE__ */ jsx(Link, { to: "/master-admin/login", className: "admin-option-btn master-admin-btn", children: "Master Admin Access" })
              ] })
            ] })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsx("footer", { className: "admin-landing__footer", children: /* @__PURE__ */ jsx("p", { children: "Secure admin portal for AYG" }) })
  ] });
};
const useAdminAuth$1 = () => {
  const dispatch = useDispatch();
  const adminAuth = useSelector(selectAdminAuth);
  const currentAdmin = useSelector(selectCurrentAdmin);
  const isLoading = useSelector(selectAdminLoading);
  const error = useSelector(selectAdminError);
  const isAuthenticated = useSelector(selectIsAdminAuthenticated);
  const allAdminAccounts = useSelector(selectAllAdminAccounts);
  const transformAdminFromApi = (apiAdmin) => {
    return {
      // Original backend fields (preserve exactly as received)
      ...apiAdmin,
      // Aliases for frontend compatibility
      id: apiAdmin.id,
      full_name: apiAdmin.full_name,
      username: apiAdmin.full_name,
      name: apiAdmin.full_name,
      // Email aliases
      email: apiAdmin.email,
      account: apiAdmin.email,
      // Phone aliases  
      phone: apiAdmin.phone,
      mobile: apiAdmin.phone,
      mobileNumber: apiAdmin.phone,
      // Status and role
      role: apiAdmin.role,
      isActive: apiAdmin.is_active !== false,
      // Timestamps
      created_at: apiAdmin.created_at,
      createdAt: apiAdmin.created_at || (/* @__PURE__ */ new Date()).toISOString(),
      updated_at: apiAdmin.updated_at,
      updatedAt: apiAdmin.updated_at || (/* @__PURE__ */ new Date()).toISOString(),
      loginTime: (/* @__PURE__ */ new Date()).toISOString()
    };
  };
  const loginAdmin2 = async (accountOrMobileOrEmail, password) => {
    try {
      dispatch(setLoading$1(true));
      await authApi.login(accountOrMobileOrEmail, password);
      const adminData = await adminApi.getMe();
      const transformedAdmin = transformAdminFromApi(adminData);
      dispatch(loginSuccess({ admin: transformedAdmin }));
      return { success: true, admin: transformedAdmin };
    } catch (error2) {
      const errorMessage = handleApiError(error2, "Invalid credentials");
      dispatch(loginFailure(errorMessage));
      return { success: false, message: errorMessage };
    } finally {
      dispatch(setLoading$1(false));
    }
  };
  const logoutAdmin = () => {
    authApi.logout();
    dispatch(logout$1());
  };
  const checkAuthStatus = async () => {
    try {
      if (authApi.isAuthenticated()) {
        const adminData = await adminApi.getMe();
        const transformedAdmin = transformAdminFromApi(adminData);
        dispatch(loginSuccess({ admin: transformedAdmin }));
        return { success: true, admin: transformedAdmin };
      }
      return { success: false, message: "Not authenticated" };
    } catch (error2) {
      const errorMessage = handleApiError(error2, "Authentication check failed");
      dispatch(loginFailure(errorMessage));
      return { success: false, message: errorMessage };
    }
  };
  const initializeAdminAuth = async () => {
    try {
      if (authApi.isAuthenticated()) {
        return await checkAuthStatus();
      }
      return { success: false, message: "No active session" };
    } catch (error2) {
      return { success: false, message: "Initialization failed" };
    }
  };
  const clearAdminError = () => {
    dispatch(clearError$1());
  };
  const createAdminAccount2 = async (adminData) => {
    var _a;
    try {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        return { success: false, error: "No network connection. Please check your internet or backend server." };
      }
      const apiData = {
        full_name: adminData.full_name || adminData.name || adminData.username,
        email: adminData.email || adminData.account,
        phone: adminData.phone || adminData.mobile || adminData.mobileNumber,
        role: adminData.role || "studio_rental",
        password: adminData.password
      };
      const response = await adminApi.create(apiData);
      return {
        success: true,
        message: "Admin account created successfully",
        admin: transformAdminFromApi(response)
      };
    } catch (error2) {
      let errorMessage = "Failed to create admin account";
      if ((_a = error2.data) == null ? void 0 : _a.detail) {
        errorMessage = error2.data.detail;
      } else if (error2.message) {
        errorMessage = error2.message;
      }
      return { success: false, error: errorMessage, message: errorMessage };
    }
  };
  const getAllAdminAccounts = async () => {
    try {
      const response = await adminApi.getAll();
      if (Array.isArray(response)) {
        const transformedAdmins = response.map(transformAdminFromApi);
        return transformedAdmins;
      } else {
        return [];
      }
    } catch (error2) {
      return [];
    }
  };
  const updateAdminStatus2 = async (adminId, isActive) => {
    try {
      await adminApi.update(adminId, { is_active: isActive });
      return { success: true, message: `Admin ${isActive ? "activated" : "deactivated"} successfully` };
    } catch (error2) {
      const errorMessage = handleApiError(error2, "Failed to update admin status");
      return { success: false, message: errorMessage };
    }
  };
  const deleteAdminAccount2 = async (adminId) => {
    try {
      await adminApi.delete(adminId);
      return { success: true, message: "Admin account deleted successfully" };
    } catch (error2) {
      const errorMessage = handleApiError(error2, "Failed to delete admin account");
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
    loginAdmin: loginAdmin2,
    logoutAdmin,
    checkAuthStatus,
    initializeAdminAuth,
    clearError: clearAdminError,
    // Legacy compatibility
    createAdminAccount: createAdminAccount2,
    getAllAdminAccounts,
    updateAdminStatus: updateAdminStatus2,
    deleteAdminAccount: deleteAdminAccount2
  };
};
const useAdminAuth$2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  useAdminAuth: useAdminAuth$1
}, Symbol.toStringTag, { value: "Module" }));
const useInfiniteScroll = (items = [], itemsPerPage = 10, dependencies = {}) => {
  const [displayedItems, setDisplayedItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const loadMoreRef = useRef();
  const totalPages = Math.ceil(items.length / itemsPerPage);
  useEffect(() => {
    if (items.length === 0) {
      setDisplayedItems([]);
      setCurrentPage(1);
      setHasMore(false);
      return;
    }
    const firstPage = items.slice(0, itemsPerPage);
    setDisplayedItems(firstPage);
    setCurrentPage(1);
    setHasMore(items.length > itemsPerPage);
  }, [items, itemsPerPage, ...Object.values(dependencies)]);
  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    setTimeout(() => {
      const nextPage = currentPage + 1;
      const startIndex = currentPage * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const newItems = items.slice(startIndex, endIndex);
      if (newItems.length > 0) {
        setDisplayedItems((prev) => [...prev, ...newItems]);
        setCurrentPage(nextPage);
        setHasMore(endIndex < items.length);
      } else {
        setHasMore(false);
      }
      setIsLoading(false);
    }, 300);
  }, [items, currentPage, itemsPerPage, hasMore, isLoading]);
  useEffect(() => {
    loadMoreRef.current = loadMore;
  }, [loadMore]);
  useEffect(() => {
    const handleScroll = () => {
      var _a;
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
      const clientHeight = document.documentElement.clientHeight || window.innerHeight;
      if (scrollTop + clientHeight >= scrollHeight - 200) {
        (_a = loadMoreRef.current) == null ? void 0 : _a.call(loadMoreRef);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const handleLoadMore = () => {
    loadMore();
  };
  const resetPagination = useCallback(() => {
    if (items.length === 0) {
      setDisplayedItems([]);
    } else {
      const firstPage = items.slice(0, itemsPerPage);
      setDisplayedItems(firstPage);
    }
    setCurrentPage(1);
    setHasMore(items.length > itemsPerPage);
  }, [items, itemsPerPage]);
  const goToPage = useCallback((page) => {
    if (page < 1 || page > totalPages) return;
    const endIndex = page * itemsPerPage;
    const pageItems = items.slice(0, endIndex);
    setDisplayedItems(pageItems);
    setCurrentPage(page);
    setHasMore(endIndex < items.length);
  }, [items, itemsPerPage, totalPages]);
  return {
    // Data
    displayedItems,
    hasMore,
    isLoading,
    currentPage,
    totalPages,
    totalItems: items.length,
    displayedCount: displayedItems.length,
    // Actions
    loadMore: handleLoadMore,
    resetPagination,
    goToPage,
    // Status
    isFirstPage: currentPage === 1,
    isLastPage: currentPage === totalPages || !hasMore,
    progress: items.length > 0 ? displayedItems.length / items.length * 100 : 0
  };
};
const ApartmentCard = ({
  apartment,
  onAddStudio
}) => {
  var _a;
  useNavigate();
  useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteRentApartment } = usePropertyManagement();
  const { showSuccess, showError } = useToast();
  const availableStudios = apartment.studios ? apartment.studios.filter((studio) => studio.isAvailable).length : 0;
  const occupiedStudios = apartment.studios ? apartment.studios.length - availableStudios : 0;
  const handleDeleteApartment = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDeleting(true);
    try {
      const result = await deleteRentApartment(apartment.id);
      if (result.success) {
        showSuccess("Rental apartment deleted successfully!");
        window.location.reload();
      } else {
        showError("Failed to delete apartment: " + result.message);
        setShowDeleteConfirm(false);
      }
    } catch (error) {
      showError("Error deleting apartment");
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };
  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };
  const handleCancelDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteConfirm(false);
  };
  return /* @__PURE__ */ jsxs("div", { className: `apartment-card ${showDeleteConfirm ? "delete-mode" : ""}`, children: [
    !showDeleteConfirm ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("div", { className: "apartment-card-header", children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "apartment-image",
            style: { backgroundImage: `url(${apartment.image || ((_a = apartment.images) == null ? void 0 : _a[0])})` },
            children: /* @__PURE__ */ jsx("div", { className: "apartment-image-overlay", children: /* @__PURE__ */ jsxs("div", { className: "apartment-stats", children: [
              /* @__PURE__ */ jsxs("span", { className: "stat-badge available", children: [
                availableStudios,
                " Available"
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "stat-badge occupied", children: [
                occupiedStudios,
                " Occupied"
              ] })
            ] }) })
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "apartment-info", children: [
          /* @__PURE__ */ jsxs("div", { className: "apartment-header-row", children: [
            /* @__PURE__ */ jsxs("div", { className: "apartment-title-section", children: [
              /* @__PURE__ */ jsx("h3", { className: "apartment-name", children: apartment.name }),
              /* @__PURE__ */ jsx("p", { className: "apartment-location", children: apartment.location })
            ] }),
            /* @__PURE__ */ jsx(
              "button",
              {
                className: "delete-apartment-btn",
                onClick: (e) => {
                  e.stopPropagation();
                  handleDeleteClick(e);
                },
                title: "Delete Apartment",
                disabled: isDeleting,
                children: /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faTrash })
              }
            )
          ] }),
          /* @__PURE__ */ jsx("p", { className: "apartment-description", children: apartment.description }),
          /* @__PURE__ */ jsx("div", { className: "apartment-facilities", children: apartment.facilities && apartment.facilities.length > 0 ? /* @__PURE__ */ jsxs(Fragment, { children: [
            apartment.facilities.slice(0, 3).map((facility, index) => /* @__PURE__ */ jsx("span", { className: "facility-tag", children: facility }, index)),
            apartment.facilities.length > 3 && /* @__PURE__ */ jsxs("span", { className: "facility-tag more", children: [
              "+",
              apartment.facilities.length - 3,
              " more"
            ] })
          ] }) : /* @__PURE__ */ jsx("span", { className: "facility-tag", children: "No facilities listed" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "apartment-card-actions", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            className: "expand-btn",
            onClick: (e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            },
            disabled: isDeleting,
            children: [
              isExpanded ? "Hide Studios" : `View ${apartment.totalStudios || (apartment.studios ? apartment.studios.length : 0)} Studios`,
              /* @__PURE__ */ jsx("span", { className: `expand-icon ${isExpanded ? "expanded" : ""}`, children: "▼" })
            ]
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "add-studio-btn",
            onClick: (e) => {
              e.stopPropagation();
              onAddStudio(apartment.id);
            },
            disabled: isDeleting,
            children: "+ Add Studio"
          }
        )
      ] })
    ] }) : /* @__PURE__ */ jsxs("div", { className: "delete-confirmation-inline", children: [
      /* @__PURE__ */ jsxs("div", { className: "delete-confirm-header", children: [
        /* @__PURE__ */ jsxs("h4", { children: [
          /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faTrash }),
          " Delete Apartment?"
        ] }),
        /* @__PURE__ */ jsxs("p", { children: [
          'Are you sure you want to delete "',
          apartment.name,
          '"?'
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "warning-box", children: [
        /* @__PURE__ */ jsx("p", { className: "warning-title", children: "⚠️ This action will permanently delete:" }),
        /* @__PURE__ */ jsxs("ul", { className: "deletion-items", children: [
          /* @__PURE__ */ jsxs("li", { children: [
            '• The apartment "',
            apartment.name,
            '"'
          ] }),
          /* @__PURE__ */ jsxs("li", { children: [
            "• All ",
            apartment.studios ? apartment.studios.length : 0,
            " studio",
            apartment.studios && apartment.studios.length !== 1 ? "s" : "",
            " in this apartment"
          ] }),
          /* @__PURE__ */ jsx("li", { children: "• All related data and bookings" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "warning-footer", children: "This will remove the apartment from Admin Portal, Master Admin Portal, and Customer Rental Page." }),
        /* @__PURE__ */ jsx("p", { className: "final-warning", children: "⚠️ This action cannot be undone!" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "delete-actions-inline", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "cancel-delete-btn",
            onClick: handleCancelDelete,
            disabled: isDeleting,
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "confirm-delete-btn-inline",
            onClick: handleDeleteApartment,
            disabled: isDeleting,
            children: isDeleting ? "Deleting..." : "Delete Everything"
          }
        )
      ] })
    ] }),
    !showDeleteConfirm && /* @__PURE__ */ jsxs("div", { className: `studios-section ${isExpanded ? "expanded" : "collapsed"}`, children: [
      isExpanded && apartment.studios && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("div", { className: "studios-grid", children: apartment.studios.map((studio) => /* @__PURE__ */ jsx(
          StudioMiniCard,
          {
            studio,
            apartmentId: apartment.id
          },
          studio.id
        )) }),
        apartment.studios.length === 0 && /* @__PURE__ */ jsxs("div", { className: "no-studios", children: [
          /* @__PURE__ */ jsx("p", { children: "No studios in this apartment yet" }),
          /* @__PURE__ */ jsx(
            "button",
            {
              className: "add-first-studio-btn",
              onClick: () => onAddStudio(apartment.id),
              children: "Add First Studio"
            }
          )
        ] })
      ] }),
      isExpanded && !apartment.studios && /* @__PURE__ */ jsxs("div", { className: "no-studios", children: [
        /* @__PURE__ */ jsx("p", { children: "No studios in this apartment yet" }),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "add-first-studio-btn",
            onClick: () => onAddStudio(apartment.id),
            children: "Add First Studio"
          }
        )
      ] })
    ] })
  ] });
};
const SaleApartmentCard = ({
  apartment,
  isAdminView = false,
  showCreatedBy = false
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const { deleteSaleApartment: deleteSaleApartment2 } = usePropertyManagement();
  const navigate = useNavigate();
  React.useEffect(() => {
    const deletedApartments = JSON.parse(localStorage.getItem("deletedSaleApartments") || "[]");
    if (deletedApartments.includes(apartment.id)) {
      setIsHidden(true);
    }
  }, [apartment.id]);
  const handleDeleteApartment = async (e) => {
    var _a;
    e.preventDefault();
    e.stopPropagation();
    if (isDeleting) return;
    setIsDeleting(true);
    const authToken = localStorage.getItem("api_access_token");
    console.group("🗑️ DELETE SALE APARTMENT - DIAGNOSTIC");
    console.groupEnd();
    if (!authToken) {
      const errorEl = document.createElement("div");
      errorEl.style.cssText = "position: fixed; top: 20px; right: 20px; background: #ef4444; color: white; padding: 20px 28px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 10000; font-weight: 600; max-width: 500px;";
      errorEl.innerHTML = `
        <div style="font-size: 18px; margin-bottom: 8px;">❌ Not Logged In</div>
        <div style="font-size: 14px; line-height: 1.5; margin-bottom: 12px;">
          You must be logged in as master admin to delete apartments.
        </div>
        <div style="font-size: 13px; opacity: 0.9;">
          Redirecting to login page in 3 seconds...
        </div>
      `;
      document.body.appendChild(errorEl);
      setTimeout(() => {
        errorEl.remove();
        window.location.href = "/master-admin/login";
      }, 3e3);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      return;
    }
    try {
      const healthCheck = await fetch("http://127.0.0.1:8000/api/v1/admins/me", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${authToken}`,
          "Content-Type": "application/json"
        }
      });
      if (!healthCheck.ok) {
        if (healthCheck.status === 401) {
          const errorEl = document.createElement("div");
          errorEl.style.cssText = "position: fixed; top: 20px; right: 20px; background: #ef4444; color: white; padding: 20px 28px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 10000; font-weight: 600; max-width: 500px;";
          errorEl.innerHTML = `
            <div style="font-size: 18px; margin-bottom: 8px;">🔒 Session Expired</div>
            <div style="font-size: 14px; line-height: 1.5;">
              Your login session has expired. Please log in again.
            </div>
          `;
          document.body.appendChild(errorEl);
          localStorage.removeItem("api_access_token");
          setTimeout(() => {
            errorEl.remove();
            window.location.href = "/master-admin/login";
          }, 2500);
          setIsDeleting(false);
          setShowDeleteConfirm(false);
          return;
        }
      } else {
      }
    } catch (healthError) {
      const errorEl = document.createElement("div");
      errorEl.style.cssText = "position: fixed; top: 20px; right: 20px; background: #ef4444; color: white; padding: 20px 28px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 10000; font-weight: 600; max-width: 550px;";
      errorEl.innerHTML = `
        <div style="font-size: 18px; margin-bottom: 8px;">❌ Backend Server Not Running</div>
        <div style="font-size: 14px; line-height: 1.6; margin-bottom: 12px;">
          Cannot connect to backend server at <code style="background: rgba(0,0,0,0.2); padding: 2px 6px; border-radius: 3px;">http://localhost:8000</code>
        </div>
        <div style="font-size: 13px; opacity: 0.95; line-height: 1.5;">
          <strong>Possible causes:</strong><br/>
          • Backend server is not running<br/>
          • Server is running on different port<br/>
          • Network/firewall blocking connection<br/>
          <br/>
          <strong>Solution:</strong> Start your FastAPI backend server
        </div>
      `;
      document.body.appendChild(errorEl);
      setTimeout(() => errorEl.remove(), 8e3);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      return;
    }
    try {
      const result = await deleteSaleApartment2(apartment.id);
      if (result && result.success) {
        setShowDeleteConfirm(false);
        const successMessage = document.createElement("div");
        successMessage.style.cssText = "position: fixed; top: 20px; right: 20px; background: #10b981; color: white; padding: 16px 24px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 10000; font-weight: 600;";
        successMessage.innerHTML = `
          <div style="font-size: 16px; margin-bottom: 4px;">✅ Deleted Successfully!</div>
          <div style="font-size: 13px;">"${apartment.name}" removed from database</div>
        `;
        document.body.appendChild(successMessage);
        setTimeout(() => {
          successMessage.remove();
          window.location.reload();
        }, 1500);
      } else {
        const errorMsg = (result == null ? void 0 : result.message) || (result == null ? void 0 : result.error) || "Delete operation failed";
        const errorEl = document.createElement("div");
        errorEl.style.cssText = "position: fixed; top: 20px; right: 20px; background: #ef4444; color: white; padding: 16px 24px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 10000; font-weight: 600; max-width: 400px;";
        errorEl.innerHTML = `
          <div style="font-size: 16px; margin-bottom: 4px;">❌ Delete Failed</div>
          <div style="font-size: 13px;">${errorMsg}</div>
        `;
        document.body.appendChild(errorEl);
        setTimeout(() => errorEl.remove(), 5e3);
        setShowDeleteConfirm(false);
      }
    } catch (error) {
      if ((error == null ? void 0 : error.status) === 401 || ((_a = error == null ? void 0 : error.message) == null ? void 0 : _a.includes("Authentication failed"))) {
        const authErrorEl = document.createElement("div");
        authErrorEl.style.cssText = "position: fixed; top: 20px; right: 20px; background: #ef4444; color: white; padding: 16px 24px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 10000; font-weight: 600; max-width: 450px;";
        authErrorEl.innerHTML = `
          <div style="font-size: 16px; margin-bottom: 8px;">🔒 Session Expired</div>
          <div style="font-size: 13px; line-height: 1.5;">Your login session has expired. Please log in again. Redirecting...</div>
        `;
        document.body.appendChild(authErrorEl);
        localStorage.removeItem("api_access_token");
        setTimeout(() => {
          authErrorEl.remove();
          window.location.href = "/master-admin/login";
        }, 2500);
      } else if ((error == null ? void 0 : error.status) === 403) {
        const permErrorEl = document.createElement("div");
        permErrorEl.style.cssText = "position: fixed; top: 20px; right: 20px; background: #ef4444; color: white; padding: 16px 24px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 10000; font-weight: 600; max-width: 450px;";
        permErrorEl.innerHTML = `
          <div style="font-size: 16px; margin-bottom: 8px;">❌ Access Denied</div>
          <div style="font-size: 13px; line-height: 1.5;">You don't have permission to delete this apartment. Only the creator or master admin can delete.</div>
        `;
        document.body.appendChild(permErrorEl);
        setTimeout(() => permErrorEl.remove(), 5e3);
      } else if ((error == null ? void 0 : error.status) === 404) {
        setIsHidden(true);
        const notFoundEl = document.createElement("div");
        notFoundEl.style.cssText = "position: fixed; top: 20px; right: 20px; background: #f59e0b; color: white; padding: 16px 24px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 10000; font-weight: 600;";
        notFoundEl.innerHTML = `
          <div style="font-size: 16px; margin-bottom: 4px;">⚠️ Already Deleted</div>
          <div style="font-size: 13px;">This apartment no longer exists.</div>
        `;
        document.body.appendChild(notFoundEl);
        setTimeout(() => {
          notFoundEl.remove();
          window.location.reload();
        }, 2e3);
      } else {
        const genericErrorEl = document.createElement("div");
        genericErrorEl.style.cssText = "position: fixed; top: 20px; right: 20px; background: #ef4444; color: white; padding: 16px 24px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 10000; font-weight: 600; max-width: 450px;";
        genericErrorEl.innerHTML = `
          <div style="font-size: 16px; margin-bottom: 8px;">❌ Delete Failed</div>
          <div style="font-size: 13px; line-height: 1.5;">${(error == null ? void 0 : error.message) || "Unable to delete apartment. Please try again."}</div>
        `;
        document.body.appendChild(genericErrorEl);
        setTimeout(() => genericErrorEl.remove(), 5e3);
      }
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };
  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };
  const handleCancelDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteConfirm(false);
  };
  const handleCardClick = () => {
    const currentPath = window.location.pathname;
    let navigationSource = "admin-dashboard";
    if (currentPath.includes("/master-admin/dashboard")) {
      navigationSource = "master-admin-dashboard";
    }
    navigate(`/admin/apartment-sale/${apartment.id}?source=${navigationSource}`);
  };
  const formatPrice = (price) => {
    if (!price) return "Contact for price";
    if (price >= 1e6) {
      return `${(price / 1e6).toFixed(1)}M EGP`;
    }
    return price.toLocaleString("en-EG") + " EGP";
  };
  const getAvailabilityStatus = () => {
    if (apartment.isAvailable === false) return "Sold";
    return "Available";
  };
  if (isHidden) {
    return null;
  }
  return /* @__PURE__ */ jsx("div", { className: `sale-apartment-card ${showDeleteConfirm ? "delete-mode" : ""}`, onClick: !showDeleteConfirm ? handleCardClick : void 0, children: !showDeleteConfirm ? /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: "sale-apartment-card__image-container", children: [
      /* @__PURE__ */ jsx(
        "img",
        {
          src: apartment.images && apartment.images.length > 0 ? apartment.images[0] : apartment.image || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="%236b7280"%3ENo Image%3C/text%3E%3C/svg%3E',
          alt: apartment.name,
          className: "sale-apartment-card__image",
          onError: (e) => {
            e.target.onerror = null;
            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="%236b7280"%3ENo Image%3C/text%3E%3C/svg%3E';
          }
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "sale-apartment-card__availability", children: getAvailabilityStatus() }),
      /* @__PURE__ */ jsx("div", { className: "sale-apartment-card__sale-badge", children: "FOR SALE" }),
      /* @__PURE__ */ jsx(
        "button",
        {
          className: "sale-apartment-card__delete-btn",
          onClick: handleDeleteClick,
          title: "Delete Apartment",
          disabled: isDeleting,
          children: /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faTrash })
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "sale-apartment-card__content", children: [
      /* @__PURE__ */ jsx("h3", { className: "sale-apartment-card__title", children: apartment.name }),
      /* @__PURE__ */ jsxs("div", { className: "apartment-sale-card__location", children: [
        /* @__PURE__ */ jsx("span", { className: "location-icon", children: /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faMapMarkerAlt }) }),
        /* @__PURE__ */ jsx("span", { children: apartment.location })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "apartment-sale-card__details", children: [
        /* @__PURE__ */ jsxs("span", { className: "detail-item", children: [
          /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faBed }),
          " ",
          apartment.bedrooms || "N/A"
        ] }),
        /* @__PURE__ */ jsxs("span", { className: "detail-item", children: [
          /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faShower }),
          " ",
          apartment.bathrooms || "N/A"
        ] }),
        /* @__PURE__ */ jsxs("span", { className: "detail-item", children: [
          /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faRuler }),
          " ",
          apartment.area ? `${apartment.area} sq ft` : "N/A"
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "sale-apartment-card__price", children: formatPrice(apartment.price) }),
      showCreatedBy && /* @__PURE__ */ jsx("div", { className: "sale-apartment-card__created-by", children: /* @__PURE__ */ jsxs("span", { children: [
        "Created by: ",
        apartment.createdBy
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "sale-apartment-card__listed", children: [
        "Listed: ",
        new Date(apartment.listedAt || apartment.createdAt).toLocaleDateString()
      ] })
    ] })
  ] }) : /* @__PURE__ */ jsxs("div", { className: "delete-confirmation-inline-sale", children: [
    /* @__PURE__ */ jsxs("div", { className: "delete-confirm-header", children: [
      /* @__PURE__ */ jsxs("h4", { children: [
        /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faTrash }),
        " Delete Sale Apartment?"
      ] }),
      /* @__PURE__ */ jsxs("p", { children: [
        'Are you sure you want to delete "',
        apartment.name,
        '"?'
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "warning-box", children: [
      /* @__PURE__ */ jsx("p", { className: "warning-title", children: "⚠️ This action will permanently delete:" }),
      /* @__PURE__ */ jsxs("ul", { className: "deletion-items", children: [
        /* @__PURE__ */ jsxs("li", { children: [
          '• The apartment "',
          apartment.name,
          '"'
        ] }),
        /* @__PURE__ */ jsx("li", { children: "• All listing information and details" }),
        /* @__PURE__ */ jsx("li", { children: "• All related data and inquiries" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "warning-footer", children: "This will remove the apartment from Admin Portal, Master Admin Portal, and Customer Sales Page." }),
      /* @__PURE__ */ jsx("p", { className: "final-warning", children: "⚠️ This action cannot be undone!" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "delete-actions-inline", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          className: "cancel-delete-btn",
          onClick: handleCancelDelete,
          disabled: isDeleting,
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          className: "confirm-delete-btn-inline",
          onClick: handleDeleteApartment,
          disabled: isDeleting,
          children: isDeleting ? "Deleting..." : "Delete Apartment"
        }
      )
    ] })
  ] }) });
};
const useUniqueId = () => {
  const generateId2 = useCallback((prefix = "") => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`;
  }, []);
  const generateApartmentId = useCallback(() => {
    return generateId2("apt");
  }, [generateId2]);
  const generateStudioId = useCallback(() => {
    return generateId2("studio");
  }, [generateId2]);
  const generateAdminId = useCallback(() => {
    return generateId2("admin");
  }, [generateId2]);
  return {
    generateId: generateId2,
    generateApartmentId,
    generateStudioId,
    generateAdminId
  };
};
const useProperty = () => {
  const dispatch = useDispatch();
  const apartments = useSelector(selectApartments);
  const saleApartments = useSelector(selectSaleApartments);
  const isLoading = useSelector(selectPropertyLoading);
  const error = useSelector(selectPropertyError);
  const getApartmentsByCreator = (createdBy) => {
    return apartments.filter((apartment) => apartment.createdBy === createdBy);
  };
  const getAllAvailableStudios = () => {
    return apartments.reduce((allStudios, apartment) => {
      const availableStudios = apartment.studios.filter((studio) => studio.isAvailable);
      return [...allStudios, ...availableStudios];
    }, []);
  };
  const getAllStudios = () => {
    return apartments.reduce((allStudios, apartment) => {
      return [...allStudios, ...apartment.studios];
    }, []);
  };
  const getStudiosByCreator = (createdBy) => {
    return apartments.reduce((allStudios, apartment) => {
      const adminStudios = apartment.studios.filter(
        (studio) => studio.createdBy === createdBy || apartment.createdBy === createdBy
      );
      return [...allStudios, ...adminStudios];
    }, []);
  };
  const getStudioById = (studioId) => {
    for (const apartment of apartments) {
      const studio = apartment.studios.find((studio2) => studio2.id === studioId);
      if (studio) return studio;
    }
    return null;
  };
  const getApartmentById = (apartmentId) => {
    return apartments.find((apt) => apt.id === apartmentId);
  };
  const getSaleApartmentsByCreator = (createdBy) => {
    return saleApartments.filter((apartment) => apartment.createdBy === createdBy);
  };
  const getAllAvailableSaleApartments = () => {
    return saleApartments.filter((apartment) => apartment.isAvailable !== false);
  };
  const getSaleApartmentById = (apartmentId) => {
    return saleApartments.find((apartment) => apartment.id === apartmentId);
  };
  const getAllAdminCreators = () => {
    const creators = /* @__PURE__ */ new Set();
    apartments.forEach((apartment) => {
      if (apartment.createdBy) {
        creators.add(apartment.createdBy);
      }
      apartment.studios.forEach((studio) => {
        if (studio.createdBy) {
          creators.add(studio.createdBy);
        }
      });
    });
    return Array.from(creators);
  };
  const helpers = useMemo(() => ({
    // Apartment functions
    addApartment: (apartment) => dispatch(addApartment(apartment)),
    updateApartment: (apartment) => dispatch(updateApartment(apartment)),
    deleteApartment: (apartmentId) => dispatch(deleteApartment(apartmentId)),
    // Studio functions
    addStudio: (apartmentId, studio) => dispatch(addStudio({ apartmentId, studio })),
    updateStudio: (apartmentId, studio) => dispatch(updateStudio({ apartmentId, studio })),
    deleteStudio: (apartmentId, studioId) => dispatch(deleteStudio({ apartmentId, studioId })),
    toggleStudioAvailability: (apartmentId, studioId) => dispatch(toggleStudioAvailability({ apartmentId, studioId })),
    // Sale apartment functions
    addSaleApartment: (apartment) => dispatch(addSaleApartment(apartment)),
    updateSaleApartment: (apartment) => dispatch(updateSaleApartment(apartment)),
    deleteSaleApartment: (apartmentId) => dispatch(deleteSaleApartment(apartmentId)),
    // Clear data
    clearAllData: () => dispatch(clearAllData()),
    // Debug function to verify data consistency across portals
    verifyDataConsistency: () => {
      const totalApartments = apartments.length;
      const totalStudios = getAllStudios().length;
      const availableStudios = getAllAvailableStudios().length;
      apartments.forEach((apartment) => {
      });
      return { totalApartments, totalStudios, availableStudios, apartments };
    }
  }), [dispatch, apartments, getAllAvailableStudios, getAllStudios]);
  return {
    apartments,
    saleApartments,
    isLoading,
    error,
    // Helper functions
    getApartmentsByCreator,
    getAllAvailableStudios,
    getAllStudios,
    getStudiosByCreator,
    getStudioById,
    getApartmentById,
    getSaleApartmentsByCreator,
    getAllAvailableSaleApartments,
    getSaleApartmentById,
    getAllAdminCreators,
    ...helpers
  };
};
const useAdminAuth = () => {
  const dispatch = useDispatch();
  const currentAdmin = useSelector(selectCurrentAdmin);
  const isLoading = useSelector(selectAdminLoading);
  const error = useSelector(selectAdminError);
  const allAdmins = useSelector(selectAllAdmins);
  const isAuthenticated = useSelector(selectIsAdminAuthenticated);
  const allAdminAccounts = useSelector(selectAllAdminAccounts);
  const helpers = useMemo(() => ({
    loginAdmin: (accountOrMobileOrEmail, password) => dispatch(loginAdmin(accountOrMobileOrEmail, password)),
    createAdminAccount: (adminData) => dispatch(createAdminAccount(adminData)),
    logoutAdmin: () => dispatch(logout$1()),
    updateAdminStatus: (adminId, isActive) => dispatch(updateAdminStatus({ adminId, isActive })),
    deleteAdminAccount: (adminId) => dispatch(deleteAdminAccount(adminId)),
    updateAdminPassword: (adminId, newPassword) => dispatch(updateAdminPassword({ adminId, newPassword })),
    clearError: () => dispatch(clearError$1()),
    isAdminAuthenticated: () => isAuthenticated,
    getAllAdminAccounts: async () => {
      const { adminApi: adminApi2 } = await Promise.resolve().then(() => api);
      try {
        const response = await adminApi2.getAll();
        if (Array.isArray(response)) {
          return response.map((admin) => ({
            id: admin.id,
            username: admin.full_name,
            name: admin.full_name,
            full_name: admin.full_name,
            account: admin.email,
            email: admin.email,
            mobileNumber: admin.phone,
            mobile: admin.phone,
            phone: admin.phone,
            role: admin.role,
            createdAt: admin.created_at || (/* @__PURE__ */ new Date()).toISOString(),
            isActive: admin.is_active !== false
          }));
        }
        return [];
      } catch (error2) {
        return [];
      }
    }
  }), [dispatch, isAuthenticated, allAdminAccounts]);
  return {
    currentAdmin,
    isLoading,
    error,
    allAdmins,
    isAuthenticated,
    ...helpers
  };
};
const useMasterAuth = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  const isLoading = useSelector(selectMasterLoading);
  const error = useSelector(selectMasterError);
  const isAuthenticated = useSelector(selectIsMasterAuthenticated);
  const currentUserProfile = useSelector(selectCurrentUserProfile);
  const helpers = useMemo(() => ({
    login: (loginData) => dispatch(loginMasterAdmin(loginData)),
    logout: () => dispatch(logout()),
    updateProfile: (updateData) => dispatch(updateMasterProfile(updateData)),
    clearError: () => dispatch(clearError()),
    isAuthenticated: () => isAuthenticated,
    getCurrentUserProfile: () => currentUserProfile
  }), [dispatch, isAuthenticated, currentUserProfile]);
  return {
    currentUser,
    isLoading,
    error,
    isAuthenticated,
    currentUserProfile,
    ...helpers
  };
};
const AddApartmentModal = ({ isOpen, onApartmentAdded, onClose }) => {
  useUniqueId();
  const { createRentApartment } = usePropertyManagement();
  useAdminAuth();
  const [formData, setFormData] = useState({
    name: "",
    location: "maadi",
    // Set default location
    address: "",
    description: "",
    mapUrl: "",
    facilities: [],
    floor: "1",
    // Set default floor as string
    photoFiles: [],
    // Store actual File objects instead of base64
    area: "50",
    // Set default area
    number: "",
    price: "0",
    // Set default price
    bedrooms: "1",
    bathrooms: "private",
    totalParts: "1"
  });
  const [facilityInput, setFacilityInput] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  if (!isOpen) return null;
  const isValidUrl = (string) => {
    try {
      const url = new URL(string);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch (_) {
      return false;
    }
  };
  const commonFacilities = [
    "Swimming Pool",
    "Gym",
    "Security",
    "Parking",
    "Garden",
    "Concierge",
    "Spa",
    "Business Center",
    "Rooftop Pool",
    "Children's Area",
    "Community Center",
    "Valet Parking"
  ];
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ""
      }));
    }
  };
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    const validation = validateFiles(files, 10);
    if (!validation.valid) {
      setErrors((prev) => ({
        ...prev,
        photos: validation.errors.join("; ")
      }));
      return;
    }
    setFormData((prev) => ({
      ...prev,
      photoFiles: [...prev.photoFiles, ...files]
    }));
    if (errors.photos) {
      setErrors((prev) => ({
        ...prev,
        photos: ""
      }));
    }
  };
  const removePhoto = (index) => {
    setFormData((prev) => ({
      ...prev,
      photoFiles: prev.photoFiles.filter((_, i) => i !== index)
    }));
  };
  const addFacility = (facility) => {
    if (facility && !formData.facilities.includes(facility)) {
      setFormData((prev) => ({
        ...prev,
        facilities: [...prev.facilities, facility]
      }));
      setFacilityInput("");
    }
  };
  const removeFacility = (facilityToRemove) => {
    setFormData((prev) => ({
      ...prev,
      facilities: prev.facilities.filter((facility) => facility !== facilityToRemove)
    }));
  };
  const handleFacilityInputKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addFacility(facilityInput);
    }
  };
  const validateForm = () => {
    var _a, _b, _c, _d, _e, _f;
    const newErrors = {};
    if (!((_a = formData.name) == null ? void 0 : _a.trim())) {
      newErrors.name = "Apartment name is required (API field: name)";
    }
    if (!formData.location || !formData.location.trim() || formData.location !== "maadi" && formData.location !== "mokkattam") {
      newErrors.location = 'Location is required and must be either "maadi" or "mokkattam" (API enum requirement)';
    }
    if (!((_b = formData.address) == null ? void 0 : _b.trim())) {
      newErrors.address = "Address is required (API field: address)";
    }
    if (!((_c = formData.description) == null ? void 0 : _c.trim())) {
      newErrors.description = "Description is required";
    }
    if (formData.price && (isNaN(Number(formData.price)) || Number(formData.price) < 0)) {
      newErrors.price = "Price must be a valid non-negative number (API expects string)";
    } else if (formData.price) ;
    if (formData.bedrooms && (isNaN(Number(formData.bedrooms)) || Number(formData.bedrooms) <= 0 || !Number.isInteger(Number(formData.bedrooms)))) {
      newErrors.bedrooms = "Bedrooms must be a valid positive integer";
    } else if (formData.bedrooms) ;
    if (!((_d = formData.floor) == null ? void 0 : _d.toString().trim())) {
      newErrors.floor = "Floor is required (API field: floor, expects integer)";
    } else if (isNaN(parseInt(formData.floor)) || parseInt(formData.floor) < 0) {
      newErrors.floor = "Floor must be a valid non-negative integer";
    } else ;
    if (!((_e = formData.number) == null ? void 0 : _e.trim())) {
      newErrors.number = "Apartment number is required (API field: number)";
    } else if (formData.number.trim().length < 1) {
      newErrors.number = "Apartment number cannot be empty";
    } else ;
    if (!formData.bathrooms || formData.bathrooms !== "private" && formData.bathrooms !== "shared") {
      newErrors.bathrooms = 'Bathroom type must be either "private" or "shared" (API enum requirement)';
    }
    if (!((_f = formData.totalParts) == null ? void 0 : _f.toString().trim())) {
      newErrors.totalParts = "Total parts/studios is required (API field: total_parts, expects integer)";
    } else if (isNaN(parseInt(formData.totalParts)) || parseInt(formData.totalParts) < 1) {
      newErrors.totalParts = "Total parts must be at least 1 (positive integer required)";
    } else ;
    if (formData.area && (isNaN(parseFloat(formData.area)) || parseFloat(formData.area) <= 0)) {
      newErrors.area = "Area must be a valid positive number (API expects string representation)";
    } else if (formData.area) ;
    if (formData.mapUrl.trim() && !isValidUrl(formData.mapUrl)) {
      newErrors.mapUrl = "Please enter a valid URL (must start with http:// or https://)";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e) => {
    var _a, _b, _c;
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    const essentialFields = {
      name: (_a = formData.name) == null ? void 0 : _a.trim(),
      address: (_b = formData.address) == null ? void 0 : _b.trim(),
      number: (_c = formData.number) == null ? void 0 : _c.trim()
    };
    const emptyEssentialFields = Object.keys(essentialFields).filter((key) => !essentialFields[key]);
    if (emptyEssentialFields.length > 0) {
      const fieldNames = {
        name: "Apartment Name",
        address: "Address",
        number: "Apartment Number"
      };
      const missingFieldNames = emptyEssentialFields.map((f) => fieldNames[f]);
      setErrors({ general: `Please fill in: ${missingFieldNames.join(", ")}` });
      return;
    }
    setIsSubmitting(true);
    try {
      const apiData = {
        name: formData.name && formData.name.trim() || "Unnamed Apartment",
        // REQUIRED: Never empty
        location: formData.location && formData.location.toLowerCase() || "maadi",
        // REQUIRED: Never empty
        address: formData.address && formData.address.trim() || "Address not provided",
        // REQUIRED: Never empty
        area: formData.area && formData.area.toString().trim() || "50",
        // REQUIRED: Never empty, default 50 sqm
        number: formData.number && formData.number.trim() || "APT-001",
        // REQUIRED: Never empty
        price: formData.price && formData.price.toString().trim() || "0",
        // REQUIRED: Never empty
        bedrooms: parseInt(formData.bedrooms) || 1,
        // REQUIRED: Always valid integer
        bathrooms: formData.bathrooms === "shared" ? "shared" : "private",
        // REQUIRED: Always valid enum
        description: formData.description && formData.description.trim() || "No description provided",
        // Optional but never empty
        photos_url: [],
        // Empty array - photos uploaded separately via /api/v1/uploads/photos
        location_on_map: formData.mapUrl ? formData.mapUrl.trim() : "",
        // Optional: API field name
        facilities_amenities: formData.facilities && formData.facilities.length > 0 ? formData.facilities.join(", ") : "",
        // Optional: API expects string, not array
        floor: parseInt(formData.floor) || 1,
        // REQUIRED: Always valid integer ≥ 1
        total_parts: parseInt(formData.totalParts) || 1
        // REQUIRED: Always valid integer ≥ 1
      };
      const validatedApiData = {
        ...apiData,
        name: apiData.name || "Unnamed Apartment",
        location: apiData.location || "maadi",
        address: apiData.address || "Address not provided",
        area: apiData.area || "50",
        number: apiData.number || "APT-001",
        price: apiData.price || "0",
        description: apiData.description || "No description provided"
      };
      const result = await createRentApartment(validatedApiData);
      if (result.success) {
        const createdApartment = result.apartment;
        if (formData.photoFiles && formData.photoFiles.length > 0) {
          try {
            const uploadResult = await uploadRentalApartmentPhotos(
              createdApartment.id,
              formData.photoFiles
            );
            if (uploadResult.files && uploadResult.files.length > 0) {
              createdApartment.photos_url = uploadResult.files.map((f) => f.url);
            }
          } catch (uploadError) {
            console.error("⚠️ Photo upload failed:", uploadError);
            setErrors({
              general: `Apartment created successfully, but photo upload failed: ${uploadError.message}`
            });
          }
        }
        onApartmentAdded == null ? void 0 : onApartmentAdded(createdApartment);
        onClose();
        setFormData({
          name: "",
          location: "maadi",
          // Keep default location
          address: "",
          description: "",
          mapUrl: "",
          facilities: [],
          floor: "1",
          // Keep default floor
          photoFiles: [],
          // Reset to empty array
          area: "50",
          // Keep default area
          number: "",
          price: "0",
          // Keep default price
          bedrooms: "1",
          bathrooms: "private",
          totalParts: "1"
        });
        setErrors({});
      } else {
        setErrors({ general: result.message || "Failed to create apartment" });
      }
    } catch (error) {
      setErrors({ general: "An error occurred while adding the apartment. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "modal-overlay", children: /* @__PURE__ */ jsxs("div", { className: "add-apartment-modal", children: [
    /* @__PURE__ */ jsxs("div", { className: "modal-header", children: [
      /* @__PURE__ */ jsx("h2", { children: "Add New Apartment" }),
      /* @__PURE__ */ jsx("button", { className: "close-btn", onClick: onClose, children: "×" })
    ] }),
    /* @__PURE__ */ jsxs("form", { className: "apartment-form", onSubmit: handleSubmit, children: [
      errors.general && /* @__PURE__ */ jsx("div", { className: "error-message general-error", children: errors.general }),
      /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "name", children: "Apartment Name *" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            id: "name",
            name: "name",
            value: formData.name,
            onChange: handleInputChange,
            className: errors.name ? "error" : "",
            placeholder: "e.g., Golden Plaza Residences (REQUIRED)",
            required: true
          }
        ),
        errors.name && /* @__PURE__ */ jsx("span", { className: "error-text", children: errors.name })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "form-row", children: [
        /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "location", children: "Location *" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              id: "location",
              name: "location",
              value: formData.location,
              onChange: handleInputChange,
              className: errors.location ? "error" : "",
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "Select Location" }),
                /* @__PURE__ */ jsx("option", { value: "maadi", children: "Maadi" }),
                /* @__PURE__ */ jsx("option", { value: "mokkattam", children: "Mokkattam" })
              ]
            }
          ),
          errors.location && /* @__PURE__ */ jsx("span", { className: "error-text", children: errors.location })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "address", children: "Address *" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              id: "address",
              name: "address",
              value: formData.address,
              onChange: handleInputChange,
              className: errors.address ? "error" : "",
              placeholder: "e.g., 90th Street, New Cairo"
            }
          ),
          errors.address && /* @__PURE__ */ jsx("span", { className: "error-text", children: errors.address })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "description", children: "Description *" }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            id: "description",
            name: "description",
            value: formData.description,
            onChange: handleInputChange,
            className: errors.description ? "error" : "",
            placeholder: "Describe the apartment complex, its features, and unique selling points...",
            rows: "4"
          }
        ),
        errors.description && /* @__PURE__ */ jsx("span", { className: "error-text", children: errors.description })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "mapUrl", children: "Google Maps Link" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "url",
            id: "mapUrl",
            name: "mapUrl",
            value: formData.mapUrl,
            onChange: handleInputChange,
            className: errors.mapUrl ? "error" : "",
            placeholder: "e.g., https://maps.google.com/..."
          }
        ),
        errors.mapUrl && /* @__PURE__ */ jsx("span", { className: "error-text", children: errors.mapUrl }),
        /* @__PURE__ */ jsx("small", { className: "form-help", children: "Optional: Paste the Google Maps link for the apartment location" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "form-row", children: [
        /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "area", children: "Area (sqm) *" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              id: "area",
              name: "area",
              value: formData.area,
              onChange: handleInputChange,
              className: errors.area ? "error" : "",
              placeholder: "e.g., 120",
              min: "1",
              step: "0.1"
            }
          ),
          errors.area && /* @__PURE__ */ jsx("span", { className: "error-text", children: errors.area })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "number", children: "Apartment Number *" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              id: "number",
              name: "number",
              value: formData.number,
              onChange: handleInputChange,
              className: errors.number ? "error" : "",
              placeholder: "e.g., A-101"
            }
          ),
          errors.number && /* @__PURE__ */ jsx("span", { className: "error-text", children: errors.number })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "form-row", children: [
        /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "bedrooms", children: "Bedrooms *" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              id: "bedrooms",
              name: "bedrooms",
              value: formData.bedrooms,
              onChange: handleInputChange,
              className: errors.bedrooms ? "error" : "",
              placeholder: "e.g., 1",
              min: "0"
            }
          ),
          errors.bedrooms && /* @__PURE__ */ jsx("span", { className: "error-text", children: errors.bedrooms }),
          /* @__PURE__ */ jsx("small", { className: "form-help", children: "Number of bedrooms in the apartment complex" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "totalParts", children: "Total Studios/Parts *" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              id: "totalParts",
              name: "totalParts",
              value: formData.totalParts,
              onChange: handleInputChange,
              className: errors.totalParts ? "error" : "",
              placeholder: "e.g., 4",
              min: "1"
            }
          ),
          errors.totalParts && /* @__PURE__ */ jsx("span", { className: "error-text", children: errors.totalParts }),
          /* @__PURE__ */ jsx("small", { className: "form-help", children: "How many studio units in this apartment" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "form-row", children: /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "bathrooms", children: "Bathroom Type *" }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            id: "bathrooms",
            name: "bathrooms",
            value: formData.bathrooms,
            onChange: handleInputChange,
            className: errors.bathrooms ? "error" : "",
            children: [
              /* @__PURE__ */ jsx("option", { value: "private", children: "Private" }),
              /* @__PURE__ */ jsx("option", { value: "shared", children: "Shared" })
            ]
          }
        ),
        errors.bathrooms && /* @__PURE__ */ jsx("span", { className: "error-text", children: errors.bathrooms })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "floor", children: "Floor *" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            id: "floor",
            name: "floor",
            value: formData.floor,
            onChange: handleInputChange,
            className: errors.floor ? "error" : "",
            placeholder: "e.g., Ground Floor, 1st Floor, 2nd Floor"
          }
        ),
        errors.floor && /* @__PURE__ */ jsx("span", { className: "error-text", children: errors.floor })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "photos", children: "Apartment Photos *" }),
        /* @__PURE__ */ jsxs("div", { className: "photo-upload-container", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "file",
              id: "photos",
              name: "photos",
              multiple: true,
              accept: "image/*",
              onChange: handlePhotoUpload,
              className: "photo-upload-input"
            }
          ),
          /* @__PURE__ */ jsxs("label", { htmlFor: "photos", className: "photo-upload-label", children: [
            /* @__PURE__ */ jsx("div", { className: "upload-icon", children: "🏢" }),
            /* @__PURE__ */ jsxs("div", { className: "upload-text", children: [
              /* @__PURE__ */ jsx("strong", { children: "Click to upload apartment photos (optional)" }),
              /* @__PURE__ */ jsx("span", { children: "or drag and drop" })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "upload-hint", children: "PNG, JPG, GIF up to 10MB each" })
          ] })
        ] }),
        errors.photos && /* @__PURE__ */ jsx("span", { className: "error-text", children: errors.photos }),
        formData.photoFiles.length > 0 && /* @__PURE__ */ jsx("div", { className: "photo-preview-grid", children: formData.photoFiles.map((file, index) => /* @__PURE__ */ jsxs("div", { className: "photo-preview-item", children: [
          /* @__PURE__ */ jsx(
            "img",
            {
              src: URL.createObjectURL(file),
              alt: `Apartment ${index + 1}`,
              className: "photo-preview-image"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: "photo-remove-btn",
              onClick: () => removePhoto(index),
              title: "Remove photo",
              children: "×"
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "photo-name", children: file.name })
        ] }, index)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "facilities", children: "Facilities & Amenities" }),
        /* @__PURE__ */ jsxs("div", { className: "facility-input-section", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: facilityInput,
              onChange: (e) => setFacilityInput(e.target.value),
              onKeyPress: handleFacilityInputKeyPress,
              placeholder: "Type a facility and press Enter",
              className: "facility-input"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => addFacility(facilityInput),
              className: "add-facility-btn",
              children: "Add"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "common-facilities", children: [
          /* @__PURE__ */ jsx("p", { children: "Common facilities:" }),
          /* @__PURE__ */ jsx("div", { className: "facility-suggestions", children: commonFacilities.map((facility) => /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: "facility-suggestion",
              onClick: () => addFacility(facility),
              disabled: formData.facilities.includes(facility),
              children: facility
            },
            facility
          )) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "selected-facilities", children: formData.facilities.map((facility) => /* @__PURE__ */ jsxs("div", { className: "selected-facility", children: [
          /* @__PURE__ */ jsx("span", { children: facility }),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => removeFacility(facility),
              className: "remove-facility",
              children: "×"
            }
          )
        ] }, facility)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "modal-actions", children: [
        /* @__PURE__ */ jsx("button", { type: "button", className: "cancel-btn", onClick: onClose, children: "Cancel" }),
        /* @__PURE__ */ jsx("button", { type: "submit", className: "submit-btn", disabled: isSubmitting, children: isSubmitting ? "Adding Apartment..." : "Add Apartment" })
      ] })
    ] })
  ] }) });
};
const AdminDashboard = () => {
  const navigate = useNavigate();
  const { currentAdmin, logoutAdmin } = useAdminAuth$1();
  const propertyManager = usePropertyManagement();
  const [adminApartments, setAdminApartments] = useState([]);
  const [adminSaleApartments, setAdminSaleApartments] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dataError, setDataError] = useState(null);
  const [isAddStudioModalOpen, setIsAddStudioModalOpen] = useState(false);
  const [isAddApartmentModalOpen, setIsAddApartmentModalOpen] = useState(false);
  const [isAddSaleApartmentModalOpen, setIsAddSaleApartmentModalOpen] = useState(false);
  const [selectedApartmentId, setSelectedApartmentId] = useState(null);
  const [isProcessingStudio, setIsProcessingStudio] = useState(false);
  const [isProcessingApartment, setIsProcessingApartment] = useState(false);
  const { showSuccess, showError } = useToast();
  const adminRole = (currentAdmin == null ? void 0 : currentAdmin.role) || "studio_rental";
  const transformRentApartmentData = (apiApartment) => ({
    id: apiApartment.id,
    title: apiApartment.name,
    name: apiApartment.name,
    location: apiApartment.location,
    address: apiApartment.address,
    price: parseFloat(apiApartment.price) || 0,
    area: parseFloat(apiApartment.area) || 0,
    bedrooms: apiApartment.bedrooms,
    bathrooms: apiApartment.bathrooms,
    description: apiApartment.description,
    images: apiApartment.photos_url || [],
    contactNumber: apiApartment.contact_number,
    floor: apiApartment.floor,
    totalStudios: apiApartment.total_parts || 0,
    createdBy: apiApartment.listed_by_admin_id,
    createdAt: apiApartment.created_at,
    updatedAt: apiApartment.updated_at,
    // Add studios if they exist in the response
    studios: (apiApartment.apartment_parts || []).map((part) => ({
      id: part.id,
      apartmentId: part.apartment_id,
      studioNumber: part.studio_number,
      title: part.title || `Studio ${part.studio_number}`,
      unitNumber: part.studio_number,
      rentValue: parseFloat(part.monthly_price) || parseFloat(part.rent_value) || 0,
      price: `${parseFloat(part.monthly_price) || parseFloat(part.rent_value) || 0} EGP/month`,
      area: `${parseFloat(part.area) || 0} sq ft`,
      floor: `Floor ${part.floor || "N/A"}`,
      bedrooms: part.bedrooms || 1,
      bathrooms: part.bathrooms || "private",
      furnished: part.furnished || "no",
      balcony: part.balcony || "no",
      description: part.description || "",
      images: part.photos_url || [],
      status: part.status,
      isAvailable: part.status === "available",
      createdBy: part.created_by_admin_id,
      createdAt: part.created_at
    }))
  });
  const transformSaleApartmentData = (apiApartment) => ({
    id: apiApartment.id,
    title: apiApartment.name,
    name: apiApartment.name,
    location: apiApartment.location,
    address: apiApartment.address,
    price: parseFloat(apiApartment.price) || 0,
    area: parseFloat(apiApartment.area) || 0,
    bedrooms: apiApartment.bedrooms,
    bathrooms: apiApartment.bathrooms,
    description: apiApartment.description,
    images: apiApartment.photos_url || [],
    contactNumber: apiApartment.contact_number,
    floor: apiApartment.floor,
    unitNumber: apiApartment.number,
    createdBy: apiApartment.listed_by_admin_id,
    createdAt: apiApartment.created_at,
    updatedAt: apiApartment.updated_at,
    type: "sale",
    isAvailable: true
  });
  const fetchAdminContent = async () => {
    try {
      setIsLoadingData(true);
      setDataError(null);
      const response = await myContentApi.getMyContent();
      const rentApartments = (response.rent_apartments || []).map(transformRentApartmentData);
      const saleApartments = (response.sale_apartments || []).map(transformSaleApartmentData);
      setAdminApartments(rentApartments);
      setAdminSaleApartments(saleApartments);
      return { success: true, rentApartments, saleApartments };
    } catch (error) {
      const errorMessage = handleApiError(error, "Failed to load your properties");
      setDataError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoadingData(false);
    }
  };
  useEffect(() => {
    if (currentAdmin) {
      fetchAdminContent();
    }
  }, [currentAdmin]);
  const handleLogout = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      logoutAdmin();
      navigate("/admin");
    } catch (error) {
    }
  };
  const handleAddStudio = (apartmentId = null) => {
    setSelectedApartmentId(apartmentId);
    setIsAddStudioModalOpen(true);
  };
  const handleAddApartment = () => {
    setIsAddApartmentModalOpen(true);
  };
  const handleStudioAdded = async (studioData) => {
    setIsProcessingStudio(true);
    try {
      const apartmentId = selectedApartmentId || studioData.apartmentId;
      if (!apartmentId) {
        throw new Error("No apartment ID available. Please select an apartment first.");
      }
      const result = await propertyManager.createStudio(apartmentId, studioData);
      if (result.success) {
        await fetchAdminContent();
        setIsAddStudioModalOpen(false);
        setSelectedApartmentId(null);
        showSuccess("Studio added successfully!");
      } else {
        showError("Failed to add studio: " + result.message);
      }
    } catch (error) {
      showError(error.message || "Failed to add studio");
    } finally {
      setIsProcessingStudio(false);
    }
  };
  const handleApartmentAdded = async (apartmentData) => {
    setIsProcessingApartment(true);
    try {
      let result;
      if (adminRole === "studio_rental") {
        result = await propertyManager.createRentApartment(apartmentData);
        setIsAddApartmentModalOpen(false);
      } else if (adminRole === "apartment_sale") {
        result = await propertyManager.createSaleApartment(apartmentData);
        setIsAddSaleApartmentModalOpen(false);
      }
      if (result == null ? void 0 : result.success) {
        await fetchAdminContent();
      } else {
      }
    } catch (error) {
    } finally {
      setIsProcessingApartment(false);
    }
  };
  const handleAddSaleApartment = () => {
    setIsAddSaleApartmentModalOpen(true);
  };
  const handleRetryLoadData = () => {
    fetchAdminContent();
  };
  if (!currentAdmin) {
    return /* @__PURE__ */ jsx("div", { className: "admin-dashboard-loading", children: /* @__PURE__ */ jsx(LoadingSpinner, { size: "large" }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "admin-dashboard", children: [
    /* @__PURE__ */ jsx("div", { className: "admin-hero", style: { backgroundImage: `url(${heroImg})` }, children: /* @__PURE__ */ jsx("div", { className: "admin-hero-overlay", children: /* @__PURE__ */ jsxs("div", { className: "admin-hero-content", children: [
      /* @__PURE__ */ jsxs("nav", { className: "admin-nav", children: [
        /* @__PURE__ */ jsxs("div", { className: "admin-brand", children: [
          /* @__PURE__ */ jsx("img", { src: aygLogo, alt: "AYG Logo", className: "brand-logo" }),
          /* @__PURE__ */ jsx("span", { className: "brand-text", children: "AYG" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "admin-nav-actions", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => navigate("/admin/rental-alerts"),
              className: "rental-alerts-btn",
              children: "🔔 Rental Alerts"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: handleLogout,
              className: "logout-btn",
              children: "Logout"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "admin-dashboard-header", children: [
        /* @__PURE__ */ jsxs("h2", { className: "dashboard-title", children: [
          "My ",
          /* @__PURE__ */ jsx("span", { className: "accent", children: "Properties" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "dashboard-subtitle", children: adminRole === "studio_rental" ? "Manage your rental apartments and studios" : "Manage your apartments for sale" }),
        /* @__PURE__ */ jsx("div", { className: "dashboard-controls", children: /* @__PURE__ */ jsx("div", { className: "cta-group", children: adminRole === "studio_rental" ? /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleAddApartment,
            className: "btn btn--primary",
            disabled: isProcessingApartment || isProcessingStudio,
            children: isProcessingApartment ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(LoadingSpinner, { size: "small", color: "white", inline: true }),
              "Processing..."
            ] }) : "+ Add New Rental Apartment"
          }
        ) }) : /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleAddSaleApartment,
            className: "btn btn--primary",
            disabled: isProcessingApartment,
            children: isProcessingApartment ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(LoadingSpinner, { size: "small", color: "white", inline: true }),
              "Processing..."
            ] }) : "+ List Apartment for Sale"
          }
        ) }) })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsx("div", { className: "admin-properties-section", children: /* @__PURE__ */ jsxs("div", { className: "properties-container", children: [
      isLoadingData && !dataError && /* @__PURE__ */ jsx("div", { className: "loading-state", children: /* @__PURE__ */ jsx(LoadingSpinner, { size: "large" }) }),
      dataError && /* @__PURE__ */ jsx("div", { className: "error-state", children: /* @__PURE__ */ jsxs("div", { className: "error-content", children: [
        /* @__PURE__ */ jsx("h3", { children: "Failed to Load Properties" }),
        /* @__PURE__ */ jsx("p", { children: dataError }),
        /* @__PURE__ */ jsx("button", { className: "retry-btn", onClick: handleRetryLoadData, children: "Try Again" })
      ] }) }),
      !isLoadingData && !dataError && /* @__PURE__ */ jsx(Fragment, { children: adminRole === "studio_rental" ? /* @__PURE__ */ jsx(
        AdminRentalPropertiesGrid,
        {
          apartments: adminApartments,
          onAddStudio: handleAddStudio
        }
      ) : /* @__PURE__ */ jsx(
        AdminSalePropertiesGrid,
        {
          apartments: adminSaleApartments
        }
      ) })
    ] }) }),
    adminRole === "studio_rental" && /* @__PURE__ */ jsx(
      AddStudioModal,
      {
        isOpen: isAddStudioModalOpen,
        onClose: () => setIsAddStudioModalOpen(false),
        onStudioAdded: handleStudioAdded,
        apartmentId: selectedApartmentId,
        isLoading: isProcessingStudio
      }
    ),
    adminRole === "studio_rental" && /* @__PURE__ */ jsx(
      AddApartmentModal,
      {
        isOpen: isAddApartmentModalOpen,
        onClose: () => setIsAddApartmentModalOpen(false),
        onApartmentAdded: handleApartmentAdded,
        isLoading: isProcessingApartment
      }
    ),
    adminRole === "apartment_sales" && /* @__PURE__ */ jsx(
      AddApartmentModal,
      {
        isOpen: isAddSaleApartmentModalOpen,
        onClose: () => setIsAddSaleApartmentModalOpen(false),
        onApartmentAdded: handleApartmentAdded,
        isLoading: isProcessingApartment,
        isSaleApartment: true
      }
    )
  ] });
};
const AdminRentalPropertiesGrid = ({ apartments, onAddStudio }) => {
  const {
    displayedItems,
    hasMore,
    isLoading,
    loadMore,
    totalItems,
    displayedCount
  } = useInfiniteScroll(apartments, 6);
  if (apartments.length === 0) {
    return /* @__PURE__ */ jsx("div", { className: "no-properties", children: /* @__PURE__ */ jsxs("div", { className: "no-properties-content", children: [
      /* @__PURE__ */ jsx("h3", { children: "No Rental Properties Yet" }),
      /* @__PURE__ */ jsx("p", { children: "Start by adding your first apartment to manage studios and rentals." })
    ] }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "infinite-properties-container", children: [
    totalItems > 6 && /* @__PURE__ */ jsxs("div", { className: "properties-progress", children: [
      /* @__PURE__ */ jsxs("div", { className: "progress-info", children: [
        "Showing ",
        displayedCount,
        " of ",
        totalItems,
        " properties"
      ] }),
      /* @__PURE__ */ jsx("div", { className: "progress-bar", children: /* @__PURE__ */ jsx(
        "div",
        {
          className: "progress-fill",
          style: { width: `${displayedCount / totalItems * 100}%` }
        }
      ) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "apartments-grid infinite-grid", children: displayedItems.map((apartment) => /* @__PURE__ */ jsx(
      ApartmentCard,
      {
        apartment,
        onAddStudio,
        isAdminView: true
      },
      apartment.id
    )) }),
    isLoading && /* @__PURE__ */ jsx("div", { className: "grid-loading", children: /* @__PURE__ */ jsx(LoadingSpinner, { size: "small" }) }),
    hasMore && !isLoading && /* @__PURE__ */ jsx("div", { className: "load-more-section", children: /* @__PURE__ */ jsxs("button", { onClick: loadMore, className: "load-more-properties", children: [
      "Load More Properties (",
      totalItems - displayedCount,
      " remaining)"
    ] }) }),
    !hasMore && displayedCount > 6 && /* @__PURE__ */ jsxs("div", { className: "all-loaded", children: [
      "All ",
      totalItems,
      " properties loaded"
    ] })
  ] });
};
const AdminSalePropertiesGrid = ({ apartments }) => {
  const {
    displayedItems,
    hasMore,
    isLoading,
    loadMore,
    totalItems,
    displayedCount
  } = useInfiniteScroll(apartments, 6);
  if (apartments.length === 0) {
    return /* @__PURE__ */ jsx("div", { className: "no-properties", children: /* @__PURE__ */ jsxs("div", { className: "no-properties-content", children: [
      /* @__PURE__ */ jsx("h3", { children: "No Apartments Listed for Sale" }),
      /* @__PURE__ */ jsx("p", { children: "Start by listing your first apartment for sale." })
    ] }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "infinite-properties-container", children: [
    totalItems > 6 && /* @__PURE__ */ jsxs("div", { className: "properties-progress", children: [
      /* @__PURE__ */ jsxs("div", { className: "progress-info", children: [
        "Showing ",
        displayedCount,
        " of ",
        totalItems,
        " properties"
      ] }),
      /* @__PURE__ */ jsx("div", { className: "progress-bar", children: /* @__PURE__ */ jsx(
        "div",
        {
          className: "progress-fill",
          style: { width: `${displayedCount / totalItems * 100}%` }
        }
      ) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "apartments-grid infinite-grid", children: displayedItems.map((apartment) => /* @__PURE__ */ jsx(
      SaleApartmentCard,
      {
        apartment,
        isAdminView: true
      },
      apartment.id
    )) }),
    isLoading && /* @__PURE__ */ jsx("div", { className: "grid-loading", children: /* @__PURE__ */ jsx(LoadingSpinner, { size: "small" }) }),
    hasMore && !isLoading && /* @__PURE__ */ jsx("div", { className: "load-more-section", children: /* @__PURE__ */ jsxs("button", { onClick: loadMore, className: "load-more-properties", children: [
      "Load More Properties (",
      totalItems - displayedCount,
      " remaining)"
    ] }) }),
    !hasMore && displayedCount > 6 && /* @__PURE__ */ jsxs("div", { className: "all-loaded", children: [
      "All ",
      totalItems,
      " properties loaded"
    ] })
  ] });
};
const RentalAlerts = ({ adminId, onContractDeleted, showAllAdmins = false, navigationSource = "admin-rental-alerts" }) => {
  var _a;
  const navigate = useNavigate();
  const [alertContracts, setAlertContracts] = useState([]);
  const [loading, setLoading2] = useState(true);
  const [showAllAlerts, setShowAllAlerts] = useState(false);
  const [deletingContractId, setDeletingContractId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [contractToDelete, setContractToDelete] = useState(null);
  const [adminNames, setAdminNames] = useState({});
  const { showError } = useToast();
  const calculateDaysUntilExpiry = (endDate) => {
    const today = /* @__PURE__ */ new Date();
    const expiry = new Date(endDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1e3 * 60 * 60 * 24));
    return diffDays;
  };
  const getAlertStatus = (daysRemaining) => {
    if (daysRemaining < 0) return "overdue";
    if (daysRemaining <= 7) return "critical";
    if (daysRemaining <= 30) return "warning";
    if (daysRemaining <= 60) return "info";
    return null;
  };
  const fetchRentalAlerts = useCallback(async () => {
    try {
      setLoading2(true);
      const contracts = await rentalContractsApi.getAll({ is_active: true });
      if (!contracts || !Array.isArray(contracts)) {
        setAlertContracts([]);
        return;
      }
      let filteredContracts = contracts;
      if (adminId && !showAllAdmins) {
        filteredContracts = contracts.filter(
          (contract) => contract.created_by_admin_id === adminId
        );
      }
      if (showAllAdmins) {
        try {
          const admins = await adminApi.getAll();
          const namesMap = {};
          if (Array.isArray(admins)) {
            admins.forEach((admin) => {
              namesMap[admin.id] = admin.full_name || admin.username || `Admin #${admin.id}`;
            });
          }
          setAdminNames(namesMap);
        } catch (error) {
          console.error("Failed to fetch admin names:", error);
        }
      }
      const contractsWithAlerts = await Promise.all(
        filteredContracts.map(async (contract) => {
          const daysRemaining = calculateDaysUntilExpiry(contract.rent_end_date);
          const alertStatus = getAlertStatus(daysRemaining);
          if (!alertStatus) return null;
          let studioDetails = null;
          try {
            studioDetails = await apartmentPartsApi.getById(contract.apartment_part_id);
          } catch (error) {
            console.error(`Failed to fetch studio details for part ${contract.apartment_part_id}:`, error);
          }
          return {
            ...contract,
            daysRemaining,
            alertStatus,
            studioDetails
          };
        })
      );
      const validAlerts = contractsWithAlerts.filter(Boolean).sort((a, b) => a.daysRemaining - b.daysRemaining);
      setAlertContracts(validAlerts);
    } catch (error) {
      console.error("Failed to fetch rental alerts:", error);
      setAlertContracts([]);
    } finally {
      setLoading2(false);
    }
  }, [adminId, showAllAdmins]);
  useEffect(() => {
    fetchRentalAlerts();
    const interval = setInterval(fetchRentalAlerts, 5 * 60 * 1e3);
    return () => clearInterval(interval);
  }, [fetchRentalAlerts]);
  const getAlertIcon = (status) => {
    switch (status) {
      case "overdue":
        return "🚨";
      case "critical":
        return "⚠️";
      case "warning":
        return "⏰";
      case "info":
        return "📅";
      default:
        return "📋";
    }
  };
  const getAlertClassName = (status) => {
    return `alert-card alert-${status}`;
  };
  const getAlertMessage = (contract) => {
    const days = contract.daysRemaining;
    if (days < 0) {
      return `Contract expired ${Math.abs(days)} day${Math.abs(days) !== 1 ? "s" : ""} ago`;
    } else if (days === 0) {
      return "Contract expires TODAY!";
    } else if (days === 1) {
      return "Contract expires TOMORROW!";
    } else if (days <= 7) {
      return `Contract expires in ${days} days - URGENT`;
    } else if (days <= 30) {
      return `Contract expires in ${days} days`;
    } else {
      return `Contract expires in ${days} days - Plan ahead`;
    }
  };
  const handleContactTenant = (contract) => {
    var _a2;
    const phone = contract.customer_phone;
    if (phone) {
      const message = encodeURIComponent(
        `Hello ${contract.customer_name}, your rental contract for Studio ${((_a2 = contract.studioDetails) == null ? void 0 : _a2.title) || "N/A"} is expiring soon. Please contact us to discuss renewal options.`
      );
      window.open(`https://wa.me/${phone.replace(/\+/g, "")}?text=${message}`, "_blank");
    }
  };
  const handleStudioClick = (contract) => {
    if (contract.apartment_part_id) {
      navigate(`/studio/${contract.apartment_part_id}?source=${navigationSource}`);
    }
  };
  const handleDeleteClick = (contract, e) => {
    e.stopPropagation();
    setContractToDelete(contract);
    setShowDeleteConfirm(true);
  };
  const confirmDelete = async () => {
    if (!contractToDelete) return;
    try {
      setDeletingContractId(contractToDelete.id);
      await rentalContractsApi.delete(contractToDelete.id);
      setAlertContracts((prev) => prev.filter((c) => c.id !== contractToDelete.id));
      if (onContractDeleted) {
        onContractDeleted();
      }
      setShowDeleteConfirm(false);
      setContractToDelete(null);
    } catch (error) {
      console.error("Failed to delete contract:", error);
      showError("Failed to delete contract: " + (error.message || "Unknown error"));
    } finally {
      setDeletingContractId(null);
    }
  };
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setContractToDelete(null);
  };
  if (loading) {
    return /* @__PURE__ */ jsxs("div", { className: "rental-alerts loading", children: [
      /* @__PURE__ */ jsx("div", { className: "loading-spinner" }),
      /* @__PURE__ */ jsx("p", { children: "Loading rental alerts..." })
    ] });
  }
  if (alertContracts.length === 0) {
    return /* @__PURE__ */ jsxs("div", { className: "rental-alerts no-alerts", children: [
      /* @__PURE__ */ jsx("h3", { children: "🎉 No Rental Alerts" }),
      /* @__PURE__ */ jsx("p", { children: "All your rentals are up to date!" })
    ] });
  }
  const displayedAlerts = showAllAlerts ? alertContracts : alertContracts.slice(0, 3);
  const overdueCount = alertContracts.filter((c) => c.alertStatus === "overdue").length;
  const criticalCount = alertContracts.filter((c) => c.alertStatus === "critical").length;
  const warningCount = alertContracts.filter((c) => c.alertStatus === "warning").length;
  return /* @__PURE__ */ jsxs("div", { className: "rental-alerts", children: [
    /* @__PURE__ */ jsxs("div", { className: "alerts-header", children: [
      /* @__PURE__ */ jsxs("h3", { children: [
        "🔔 Rental Alerts",
        /* @__PURE__ */ jsxs("span", { className: "alert-count", children: [
          "(",
          alertContracts.length,
          ")"
        ] })
      ] }),
      alertContracts.length > 3 && /* @__PURE__ */ jsx(
        "button",
        {
          className: "toggle-alerts-btn",
          onClick: () => setShowAllAlerts(!showAllAlerts),
          children: showAllAlerts ? "Show Less" : `Show All (${alertContracts.length})`
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "alerts-list", children: displayedAlerts.map((contract) => {
      var _a2;
      return /* @__PURE__ */ jsxs("div", { className: getAlertClassName(contract.alertStatus), children: [
        /* @__PURE__ */ jsx("div", { className: "alert-icon", children: getAlertIcon(contract.alertStatus) }),
        /* @__PURE__ */ jsxs("div", { className: "alert-content", onClick: () => handleStudioClick(contract), children: [
          /* @__PURE__ */ jsxs("div", { className: "alert-title", children: [
            /* @__PURE__ */ jsx("h4", { children: ((_a2 = contract.studioDetails) == null ? void 0 : _a2.title) || `Studio #${contract.apartment_part_id}` }),
            /* @__PURE__ */ jsxs("span", { className: "contract-dates", children: [
              new Date(contract.rent_start_date).toLocaleDateString(),
              " - ",
              new Date(contract.rent_end_date).toLocaleDateString()
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "alert-message", children: getAlertMessage(contract) }),
          /* @__PURE__ */ jsxs("div", { className: "tenant-info", children: [
            /* @__PURE__ */ jsx("strong", { children: "Tenant:" }),
            " ",
            contract.customer_name,
            contract.customer_phone && /* @__PURE__ */ jsxs("span", { className: "tenant-contact", children: [
              "• ",
              contract.customer_phone
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "contract-details", children: [
            /* @__PURE__ */ jsxs("span", { children: [
              "Monthly: EGP ",
              parseFloat(contract.rent_price).toLocaleString()
            ] }),
            /* @__PURE__ */ jsxs("span", { children: [
              "Period: ",
              contract.rent_period,
              " months"
            ] }),
            showAllAdmins && contract.created_by_admin_id && /* @__PURE__ */ jsxs("span", { className: "admin-info", children: [
              "Admin: ",
              adminNames[contract.created_by_admin_id] || `Admin #${contract.created_by_admin_id}`
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "alert-actions", children: [
          contract.customer_phone && /* @__PURE__ */ jsx(
            "button",
            {
              className: "btn btn-primary btn-sm",
              onClick: (e) => {
                e.stopPropagation();
                handleContactTenant(contract);
              },
              title: "Contact tenant via WhatsApp",
              children: "💬 WhatsApp"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              className: "btn btn-info btn-sm",
              onClick: (e) => {
                e.stopPropagation();
                handleStudioClick(contract);
              },
              title: "View studio details",
              children: "👁️ View"
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              className: "btn btn-danger btn-sm",
              onClick: (e) => handleDeleteClick(contract, e),
              disabled: deletingContractId === contract.id,
              title: "Delete contract",
              children: [
                deletingContractId === contract.id ? "⏳" : "🗑️",
                " Delete"
              ]
            }
          )
        ] })
      ] }, contract.id);
    }) }),
    alertContracts.length > 0 && /* @__PURE__ */ jsx("div", { className: "alerts-summary", children: /* @__PURE__ */ jsxs("p", { children: [
      /* @__PURE__ */ jsx("strong", { children: "Summary:" }),
      " ",
      overdueCount > 0 && /* @__PURE__ */ jsxs("span", { className: "summary-overdue", children: [
        overdueCount,
        " overdue"
      ] }),
      overdueCount > 0 && (criticalCount > 0 || warningCount > 0) && ", ",
      criticalCount > 0 && /* @__PURE__ */ jsxs("span", { className: "summary-critical", children: [
        criticalCount,
        " critical (≤7 days)"
      ] }),
      criticalCount > 0 && warningCount > 0 && ", ",
      warningCount > 0 && /* @__PURE__ */ jsxs("span", { className: "summary-warning", children: [
        warningCount,
        " expiring soon (≤30 days)"
      ] })
    ] }) }),
    showDeleteConfirm && contractToDelete && /* @__PURE__ */ jsx("div", { className: "delete-modal-overlay", onClick: cancelDelete, children: /* @__PURE__ */ jsxs("div", { className: "delete-modal", onClick: (e) => e.stopPropagation(), children: [
      /* @__PURE__ */ jsx("h3", { children: "⚠️ Confirm Deletion" }),
      /* @__PURE__ */ jsx("p", { children: "Are you sure you want to delete this rental contract?" }),
      /* @__PURE__ */ jsxs("div", { className: "contract-info-summary", children: [
        /* @__PURE__ */ jsx("strong", { children: "Studio:" }),
        " ",
        ((_a = contractToDelete.studioDetails) == null ? void 0 : _a.title) || `Studio #${contractToDelete.apartment_part_id}`,
        /* @__PURE__ */ jsx("br", {}),
        /* @__PURE__ */ jsx("strong", { children: "Tenant:" }),
        " ",
        contractToDelete.customer_name,
        /* @__PURE__ */ jsx("br", {}),
        /* @__PURE__ */ jsx("strong", { children: "Period:" }),
        " ",
        new Date(contractToDelete.rent_start_date).toLocaleDateString(),
        " - ",
        new Date(contractToDelete.rent_end_date).toLocaleDateString()
      ] }),
      /* @__PURE__ */ jsx("p", { className: "warning-text", children: "This action cannot be undone!" }),
      /* @__PURE__ */ jsxs("div", { className: "modal-actions", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "btn btn-secondary",
            onClick: cancelDelete,
            disabled: deletingContractId === contractToDelete.id,
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "btn btn-danger",
            onClick: confirmDelete,
            disabled: deletingContractId === contractToDelete.id,
            children: deletingContractId === contractToDelete.id ? "Deleting..." : "Delete Contract"
          }
        )
      ] })
    ] }) })
  ] });
};
const RentalAlertsPage = () => {
  const navigate = useNavigate();
  const { currentAdmin } = useAdminAuth$1();
  const [isLoading, setIsLoading] = useState(true);
  const [adminStats, setAdminStats] = useState({
    totalApartments: 0,
    totalStudios: 0,
    rentedStudios: 0,
    availableStudios: 0
  });
  const fetchAdminStats = useCallback(async () => {
    if ((currentAdmin == null ? void 0 : currentAdmin.id) || (currentAdmin == null ? void 0 : currentAdmin.email)) {
      setIsLoading(true);
      try {
        const apartmentsResponse = await rentApartmentsApi.getAll();
        const adminApartments = Array.isArray(apartmentsResponse) ? apartmentsResponse.filter((apt) => apt.listed_by_admin_id === currentAdmin.id) : [];
        const studiosResponse = await apartmentPartsApi.getAll();
        const allStudios = Array.isArray(studiosResponse) ? studiosResponse : [];
        const adminApartmentIds = adminApartments.map((apt) => apt.id);
        const adminStudios = allStudios.filter(
          (studio) => adminApartmentIds.includes(studio.apartment_id)
        );
        const contractsResponse = await rentalContractsApi.getAll({ is_active: true });
        const activeContracts = Array.isArray(contractsResponse) ? contractsResponse : [];
        const rentedStudioIds = new Set(activeContracts.map((contract) => contract.apartment_part_id));
        const rentedStudios = adminStudios.filter((studio) => rentedStudioIds.has(studio.id)).length;
        const availableStudios = adminStudios.length - rentedStudios;
        setAdminStats({
          totalApartments: adminApartments.length,
          totalStudios: adminStudios.length,
          rentedStudios,
          availableStudios
        });
      } catch (error) {
        console.error("Failed to fetch admin stats:", error);
        setAdminStats({
          totalApartments: 0,
          totalStudios: 0,
          rentedStudios: 0,
          availableStudios: 0
        });
      } finally {
        setIsLoading(false);
      }
    }
  }, [currentAdmin]);
  useEffect(() => {
    fetchAdminStats();
  }, [fetchAdminStats]);
  const handleContractDeleted = () => {
    fetchAdminStats();
  };
  if (!currentAdmin) {
    return /* @__PURE__ */ jsx("div", { className: "rental-alerts-page-loading", children: /* @__PURE__ */ jsx(LoadingSpinner, {}) });
  }
  if (isLoading) {
    return /* @__PURE__ */ jsx("div", { className: "rental-alerts-page-loading", children: /* @__PURE__ */ jsx(LoadingSpinner, {}) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "rental-alerts-page", children: [
    /* @__PURE__ */ jsx("div", { className: "alerts-hero", style: { backgroundImage: `url(${heroImg})` }, children: /* @__PURE__ */ jsx("div", { className: "alerts-hero-overlay", children: /* @__PURE__ */ jsxs("div", { className: "alerts-hero-content", children: [
      /* @__PURE__ */ jsxs("nav", { className: "alerts-nav", children: [
        /* @__PURE__ */ jsx("div", { className: "alerts-nav-actions", children: /* @__PURE__ */ jsx(
          BackButton,
          {
            text: "← Back to Admin Dashboard",
            onClick: () => navigate("/admin/dashboard"),
            variant: "transparent"
          }
        ) }),
        /* @__PURE__ */ jsxs("div", { className: "alerts-brand", children: [
          /* @__PURE__ */ jsx("img", { src: aygLogo, alt: "AYG Logo", className: "brand-logo" }),
          /* @__PURE__ */ jsx("span", { className: "brand-text", children: "AYG" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "alerts-page-header", children: [
        /* @__PURE__ */ jsxs("h2", { className: "alerts-title", children: [
          "Rental ",
          /* @__PURE__ */ jsx("span", { className: "accent", children: "Alerts" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "alerts-subtitle", children: "Monitor and manage rental expirations for your properties" }),
        /* @__PURE__ */ jsxs("div", { className: "alerts-stats", children: [
          /* @__PURE__ */ jsxs("div", { className: "stat-card", children: [
            /* @__PURE__ */ jsx("div", { className: "stat-number", children: adminStats.totalApartments }),
            /* @__PURE__ */ jsx("div", { className: "stat-label", children: "Apartments" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "stat-card", children: [
            /* @__PURE__ */ jsx("div", { className: "stat-number", children: adminStats.totalStudios }),
            /* @__PURE__ */ jsx("div", { className: "stat-label", children: "Total Studios" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "stat-card", children: [
            /* @__PURE__ */ jsx("div", { className: "stat-number", children: adminStats.rentedStudios }),
            /* @__PURE__ */ jsx("div", { className: "stat-label", children: "Rented" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "stat-card", children: [
            /* @__PURE__ */ jsx("div", { className: "stat-number", children: adminStats.availableStudios }),
            /* @__PURE__ */ jsx("div", { className: "stat-label", children: "Available" })
          ] })
        ] })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsx("div", { className: "alerts-main-section", children: /* @__PURE__ */ jsxs("div", { className: "alerts-container", children: [
      /* @__PURE__ */ jsxs("div", { className: "alerts-section-header", children: [
        /* @__PURE__ */ jsx("h3", { children: "🔔 Active Rental Alerts" }),
        /* @__PURE__ */ jsx("p", { children: "Studios requiring attention for rental renewals or status updates" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "alerts-content", children: /* @__PURE__ */ jsx(
        RentalAlerts,
        {
          adminId: currentAdmin == null ? void 0 : currentAdmin.id,
          onContractDeleted: handleContractDeleted,
          navigationSource: "admin-rental-alerts"
        }
      ) })
    ] }) })
  ] });
};
const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { loginAdmin: loginAdmin2 } = useAdminAuth$1();
  const [formData, setFormData] = useState({
    accountOrMobile: "",
    password: ""
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ""
      }));
    }
    if (loginError) {
      setLoginError("");
    }
  };
  const validateForm = () => {
    const newErrors = {};
    if (!formData.accountOrMobile.trim()) {
      newErrors.accountOrMobile = "Email, account or mobile number is required";
    }
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    setLoginError("");
    try {
      const result = await loginAdmin2(formData.accountOrMobile, formData.password);
      if (result.success) {
        navigate("/admin/dashboard");
      } else {
        setLoginError(result.message);
      }
    } catch (error) {
      setLoginError("Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "admin-login-page", children: /* @__PURE__ */ jsx("div", { className: "admin-login-container", children: /* @__PURE__ */ jsxs("div", { className: "login-card", children: [
    /* @__PURE__ */ jsxs("div", { className: "login-header", children: [
      /* @__PURE__ */ jsx("h1", { children: "Admin Login" }),
      /* @__PURE__ */ jsx("p", { children: "Sign in to your admin account" })
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "login-form", children: [
      loginError && /* @__PURE__ */ jsx("div", { className: "error-message", children: loginError }),
      /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "accountOrMobile", children: "Email, Account or Mobile Number" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            id: "accountOrMobile",
            name: "accountOrMobile",
            value: formData.accountOrMobile,
            onChange: handleInputChange,
            className: errors.accountOrMobile ? "error" : "",
            placeholder: "Enter your email, account or mobile number",
            autoComplete: "username"
          }
        ),
        errors.accountOrMobile && /* @__PURE__ */ jsx("span", { className: "error-text", children: errors.accountOrMobile })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "password", children: "Password" }),
        /* @__PURE__ */ jsxs("div", { className: "password-input-container", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: showPassword ? "text" : "password",
              id: "password",
              name: "password",
              value: formData.password,
              onChange: handleInputChange,
              className: errors.password ? "error" : "",
              placeholder: "Enter your password",
              autoComplete: "current-password"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: "password-toggle-btn",
              onClick: () => setShowPassword(!showPassword),
              "aria-label": "Toggle password visibility",
              children: "👁️"
            }
          )
        ] }),
        errors.password && /* @__PURE__ */ jsx("span", { className: "error-text", children: errors.password })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "submit",
          className: "login-btn",
          disabled: isSubmitting,
          children: isSubmitting ? "Signing In..." : "Sign In"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "login-footer", children: [
      /* @__PURE__ */ jsx("div", { className: "login-links", children: /* @__PURE__ */ jsx(
        BackButton,
        {
          text: "← Back to Admin Portal",
          onClick: () => navigate("/admin")
        }
      ) }),
      /* @__PURE__ */ jsxs("div", { className: "login-info", children: [
        /* @__PURE__ */ jsx("p", { children: "Don't have an admin account?" }),
        /* @__PURE__ */ jsx("p", { children: "Contact the master administrator to create one for you." })
      ] })
    ] })
  ] }) }) });
};
const MasterAdminLoginForm = () => {
  const navigate = useNavigate();
  const { login } = useMasterAuth();
  const [formData, setFormData] = useState({
    emailOrPhone: "",
    // Accept both email and mobile phone
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ""
      }));
    }
  };
  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^(\+20|0)?1[0-9]{9}$/;
    if (!formData.emailOrPhone) {
      newErrors.emailOrPhone = "Email or mobile phone is required";
    } else if (!emailRegex.test(formData.emailOrPhone) && !phoneRegex.test(formData.emailOrPhone.replace(/\s/g, ""))) {
      newErrors.emailOrPhone = "Please enter a valid email address or Egyptian mobile number";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
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
      setErrors({});
      const isEmail = formData.emailOrPhone.includes("@");
      const loginData = {
        [isEmail ? "email" : "username"]: formData.emailOrPhone,
        // Backend expects 'username' for phone
        password: formData.password
      };
      const resultAction = await login(loginData);
      if (loginMasterAdmin.fulfilled.match(resultAction)) {
        navigate("/master-admin/dashboard", {
          replace: true,
          state: { loginSuccess: true }
        });
      } else if (loginMasterAdmin.rejected.match(resultAction)) {
        const errorMessage = resultAction.payload;
        if (errorMessage.includes("Invalid credentials")) {
          setErrors({
            general: "Incorrect email/phone or password. Please check your credentials and try again.",
            emailOrPhone: "Please verify your email or phone number",
            password: "Please verify your password"
          });
        } else if (errorMessage.includes("Access denied")) {
          setErrors({
            general: "Access denied. You need master admin privileges to access this portal.",
            emailOrPhone: "This account does not have master admin access"
          });
        } else if (errorMessage.includes("Account not found")) {
          setErrors({
            general: "Account not found. Please verify your credentials.",
            emailOrPhone: "No account found with this email or phone number"
          });
        } else if (errorMessage.includes("mismatch")) {
          setErrors({
            general: "Authentication error. Please contact system administrator.",
            emailOrPhone: "Credential validation failed"
          });
        } else {
          setErrors({
            general: errorMessage || "Authentication failed. Please try again."
          });
        }
      }
    } catch (error) {
      setErrors({
        general: "Network error occurred. Please check your connection and try again."
      });
    } finally {
      setIsLoading(false);
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "master-login-container", children: /* @__PURE__ */ jsx("div", { className: "master-login-background", children: /* @__PURE__ */ jsx("div", { className: "master-login-overlay", children: /* @__PURE__ */ jsx("div", { className: "master-login-content", children: /* @__PURE__ */ jsxs("div", { className: "master-login-form-wrapper", children: [
    /* @__PURE__ */ jsx(
      BackButton,
      {
        text: " Back to Admin Portal",
        onClick: () => navigate("/admin"),
        variant: "transparent"
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "master-login-header", children: [
      /* @__PURE__ */ jsx("h1", { children: "Master Admin Login" }),
      /* @__PURE__ */ jsx("p", { children: "Sign in with your email or mobile phone" })
    ] }),
    /* @__PURE__ */ jsxs("form", { className: "master-login-form", onSubmit: handleSubmit, children: [
      errors.general && /* @__PURE__ */ jsx("div", { className: "error-message general-error", children: errors.general }),
      /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "emailOrPhone", children: "Email or Mobile Phone" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            id: "emailOrPhone",
            name: "emailOrPhone",
            value: formData.emailOrPhone,
            onChange: handleInputChange,
            className: errors.emailOrPhone ? "error" : "",
            placeholder: "Enter your email or mobile phone",
            autoComplete: "username"
          }
        ),
        errors.emailOrPhone && /* @__PURE__ */ jsx("span", { className: "error-message", children: errors.emailOrPhone })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "password", children: "Password" }),
        /* @__PURE__ */ jsxs("div", { className: "password-input-wrapper", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: showPassword ? "text" : "password",
              id: "password",
              name: "password",
              value: formData.password,
              onChange: handleInputChange,
              className: errors.password ? "error" : "",
              placeholder: "Enter your password",
              autoComplete: "current-password"
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "password-toggle", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "checkbox",
                id: "showPassword",
                checked: showPassword,
                onChange: (e) => setShowPassword(e.target.checked)
              }
            ),
            /* @__PURE__ */ jsx("label", { htmlFor: "showPassword", children: "Show Password" })
          ] })
        ] }),
        errors.password && /* @__PURE__ */ jsx("span", { className: "error-message", children: errors.password })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "submit",
          className: "submit-btn",
          disabled: isLoading,
          children: isLoading ? "Signing In..." : "Login"
        }
      ),
      /* @__PURE__ */ jsx(
        BackButton,
        {
          text: "← Back to Admin Portal",
          onClick: () => navigate("/admin", { replace: true }),
          variant: "link"
        }
      )
    ] })
  ] }) }) }) }) });
};
const AddSaleApartmentModal = ({ isOpen, onApartmentAdded, onClose }) => {
  useMasterAuth();
  const { createSaleApartment } = usePropertyManagement();
  useUniqueId();
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    address: "",
    description: "",
    price: "",
    bedrooms: "",
    bathrooms: "private",
    // REQUIRED enum: must be 'private' or 'shared', not empty string
    area: "",
    apartmentNumber: "",
    floor: "",
    mapUrl: "",
    facilities: [],
    contactNumber: "",
    photoFiles: []
    // Store actual File objects
  });
  const [facilityInput, setFacilityInput] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  if (!isOpen) return null;
  const isValidUrl = (string) => {
    try {
      const url = new URL(string);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch (_) {
      return false;
    }
  };
  const commonFacilities = [
    "Swimming Pool",
    "Gym",
    "Security",
    "Parking",
    "Garden",
    "Concierge",
    "Spa",
    "Business Center",
    "Rooftop Pool",
    "Children's Area",
    "Community Center",
    "Valet Parking",
    "Balcony",
    "Central AC",
    "Built-in Kitchen",
    "Master Bedroom",
    "Walk-in Closet",
    "Elevator",
    "Laundry Room",
    "Storage Room"
  ];
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ""
      }));
    }
  };
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    const validation = validateFiles(files, 10);
    if (!validation.valid) {
      setErrors((prev) => ({
        ...prev,
        photos: validation.errors.join("; ")
      }));
      return;
    }
    setFormData((prev) => ({
      ...prev,
      photoFiles: [...prev.photoFiles, ...files]
    }));
    if (errors.photos) {
      setErrors((prev) => ({
        ...prev,
        photos: ""
      }));
    }
  };
  const removePhoto = (index) => {
    setFormData((prev) => ({
      ...prev,
      photoFiles: prev.photoFiles.filter((_, i) => i !== index)
    }));
  };
  const addFacility = (facility) => {
    if (facility && !formData.facilities.includes(facility)) {
      setFormData((prev) => ({
        ...prev,
        facilities: [...prev.facilities, facility]
      }));
      setFacilityInput("");
    }
  };
  const removeFacility = (facilityToRemove) => {
    setFormData((prev) => ({
      ...prev,
      facilities: prev.facilities.filter((facility) => facility !== facilityToRemove)
    }));
  };
  const handleFacilityInputKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addFacility(facilityInput);
    }
  };
  const validateForm = () => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const newErrors = {};
    if (!((_a = formData.name) == null ? void 0 : _a.trim())) {
      newErrors.name = "Apartment name is required (API field: name)";
    }
    if (!((_b = formData.location) == null ? void 0 : _b.trim())) {
      newErrors.location = 'Location is required. Must be "maadi" or "mokkattam"';
    } else if (!["maadi", "mokkattam"].includes(formData.location.toLowerCase())) {
      newErrors.location = 'Location must be either "maadi" or "mokkattam"';
    }
    if (!((_c = formData.address) == null ? void 0 : _c.trim())) {
      newErrors.address = "Address is required (API field: address)";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    if (!((_d = formData.price) == null ? void 0 : _d.toString().trim())) {
      newErrors.price = "Price is required (API expects string)";
    } else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = "Please enter a valid price (positive number)";
    }
    if (!((_e = formData.bedrooms) == null ? void 0 : _e.toString().trim())) {
      newErrors.bedrooms = "Number of bedrooms is required (API expects integer)";
    } else if (isNaN(Number(formData.bedrooms)) || Number(formData.bedrooms) <= 0 || !Number.isInteger(Number(formData.bedrooms))) {
      newErrors.bedrooms = "Please enter a valid number of bedrooms (positive integer)";
    }
    if (!formData.bathrooms || formData.bathrooms !== "private" && formData.bathrooms !== "shared") {
      newErrors.bathrooms = 'Bathroom type must be either "private" or "shared" (API enum requirement)';
    }
    if (!((_f = formData.area) == null ? void 0 : _f.toString().trim())) {
      newErrors.area = "Area is required (API field: area, expects string)";
    } else if (isNaN(Number(formData.area)) || Number(formData.area) <= 0) {
      newErrors.area = "Please enter a valid area (positive number)";
    }
    if (!((_g = formData.apartmentNumber) == null ? void 0 : _g.trim())) {
      newErrors.apartmentNumber = "Apartment number is required (API field: number)";
    } else if (formData.apartmentNumber.trim().length < 1) {
      newErrors.apartmentNumber = "Apartment number cannot be empty";
    }
    if (formData.floor && formData.floor.trim() && isNaN(parseInt(formData.floor))) {
      newErrors.floor = "Floor must be a valid number if provided";
    }
    if (!((_h = formData.contactNumber) == null ? void 0 : _h.trim())) {
      newErrors.contactNumber = "Contact number is required (used for WhatsApp integration)";
    } else if (!/^(\+201|01)[0-9]{9}$/.test(formData.contactNumber.trim())) {
      newErrors.contactNumber = "Please enter a valid Egyptian mobile number (format: +201XXXXXXXXX or 01XXXXXXXXX)";
    } else ;
    if (formData.mapUrl.trim() && !isValidUrl(formData.mapUrl)) {
      newErrors.mapUrl = "Please enter a valid URL (must start with http:// or https://)";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setIsSubmitting(true);
    try {
      const apiData = {
        // === REQUIRED FIELDS ===
        name: formData.name.trim(),
        // API expects 'name', not 'title'
        location: formData.location.toLowerCase(),
        // Must be lowercase: 'maadi' or 'mokkattam'
        address: formData.address.trim(),
        // Full address string
        area: formData.area.toString(),
        // API expects string (decimal)
        number: formData.apartmentNumber.trim(),
        // API field is 'number' (e.g., "A-301")
        price: formData.price.toString(),
        // API expects string (decimal), NOT number
        bedrooms: parseInt(formData.bedrooms),
        // API expects integer
        bathrooms: formData.bathrooms,
        // API expects enum string: 'private' or 'shared' ONLY
        // === OPTIONAL FIELDS ===
        description: formData.description.trim() || "",
        // Optional description text
        photos_url: [],
        // Empty array - photos uploaded separately via /api/v1/uploads/photos
        location_on_map: formData.mapUrl ? formData.mapUrl.trim() : "",
        // Google Maps URL
        facilities_amenities: formData.facilities && formData.facilities.length > 0 ? formData.facilities.join(", ") : ""
        // API expects comma-separated string, not array
      };
      const result = await createSaleApartment(apiData);
      if (result.success) {
        const createdApartment = result.apartment;
        if (formData.photoFiles && formData.photoFiles.length > 0) {
          try {
            const uploadResult = await uploadSaleApartmentPhotos(
              createdApartment.id,
              formData.photoFiles
            );
            if (uploadResult.files && uploadResult.files.length > 0) {
              createdApartment.photos_url = uploadResult.files.map((f) => f.url);
            }
          } catch (uploadError) {
            console.error("⚠️ Photo upload failed:", uploadError);
            setErrors({
              general: `Apartment created successfully, but photo upload failed: ${uploadError.message}`
            });
          }
        }
        onApartmentAdded == null ? void 0 : onApartmentAdded(createdApartment);
        onClose();
        setFormData({
          name: "",
          location: "",
          address: "",
          description: "",
          price: "",
          bedrooms: "",
          bathrooms: "private",
          // Reset to default enum value
          area: "",
          apartmentNumber: "",
          floor: "",
          mapUrl: "",
          facilities: [],
          contactNumber: "",
          photoFiles: []
        });
        setErrors({});
      } else {
        setErrors({ general: result.message || "Failed to create apartment. Please try again." });
      }
    } catch (error) {
      const errorMessage = error.message || "An error occurred while adding the apartment. Please try again.";
      setErrors({ general: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "modal-overlay", children: /* @__PURE__ */ jsxs("div", { className: "add-sale-apartment-modal", children: [
    /* @__PURE__ */ jsxs("div", { className: "modal-header", children: [
      /* @__PURE__ */ jsx("h2", { children: "Add New Apartment for Sale" }),
      /* @__PURE__ */ jsx("button", { className: "close-btn", onClick: onClose, children: "×" })
    ] }),
    /* @__PURE__ */ jsxs("form", { className: "sale-apartment-form", onSubmit: handleSubmit, children: [
      errors.general && /* @__PURE__ */ jsx("div", { className: "error-message general-error", children: errors.general }),
      /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "name", children: "Apartment Name *" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            id: "name",
            name: "name",
            value: formData.name,
            onChange: handleInputChange,
            className: errors.name ? "error" : "",
            placeholder: "e.g., Luxury 3BR Apartment in New Cairo"
          }
        ),
        errors.name && /* @__PURE__ */ jsx("span", { className: "error-text", children: errors.name })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "form-row", children: [
        /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "location", children: "Location *" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              id: "location",
              name: "location",
              value: formData.location,
              onChange: handleInputChange,
              className: errors.location ? "error" : "",
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: "Select Location" }),
                /* @__PURE__ */ jsx("option", { value: "maadi", children: "Maadi" }),
                /* @__PURE__ */ jsx("option", { value: "mokkattam", children: "Mokkattam" })
              ]
            }
          ),
          errors.location && /* @__PURE__ */ jsx("span", { className: "error-text", children: errors.location })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "address", children: "Address *" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              id: "address",
              name: "address",
              value: formData.address,
              onChange: handleInputChange,
              className: errors.address ? "error" : "",
              placeholder: "e.g., 90th Street, Maadi"
            }
          ),
          errors.address && /* @__PURE__ */ jsx("span", { className: "error-text", children: errors.address })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "form-row", children: [
        /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "area", children: "Area (sq ft) *" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              id: "area",
              name: "area",
              value: formData.area,
              onChange: handleInputChange,
              className: errors.area ? "error" : "",
              placeholder: "e.g., 1500",
              min: "1"
            }
          ),
          errors.area && /* @__PURE__ */ jsx("span", { className: "error-text", children: errors.area })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "apartmentNumber", children: "Apartment Number *" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              id: "apartmentNumber",
              name: "apartmentNumber",
              value: formData.apartmentNumber,
              onChange: handleInputChange,
              className: errors.apartmentNumber ? "error" : "",
              placeholder: "e.g., A-301"
            }
          ),
          errors.apartmentNumber && /* @__PURE__ */ jsx("span", { className: "error-text", children: errors.apartmentNumber })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "floor", children: "Floor *" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              id: "floor",
              name: "floor",
              value: formData.floor,
              onChange: handleInputChange,
              className: errors.floor ? "error" : "",
              placeholder: "e.g., Ground Floor, 1st Floor, 2nd Floor"
            }
          ),
          errors.floor && /* @__PURE__ */ jsx("span", { className: "error-text", children: errors.floor })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "form-row", children: [
        /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "price", children: "Price (EGP) *" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              id: "price",
              name: "price",
              value: formData.price,
              onChange: handleInputChange,
              className: errors.price ? "error" : "",
              placeholder: "e.g., 2500000",
              min: "1"
            }
          ),
          errors.price && /* @__PURE__ */ jsx("span", { className: "error-text", children: errors.price })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "bedrooms", children: "Bedrooms *" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "number",
              id: "bedrooms",
              name: "bedrooms",
              value: formData.bedrooms,
              onChange: handleInputChange,
              className: errors.bedrooms ? "error" : "",
              placeholder: "e.g., 3",
              min: "1"
            }
          ),
          errors.bedrooms && /* @__PURE__ */ jsx("span", { className: "error-text", children: errors.bedrooms })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "form-row", children: /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "bathrooms", children: "Bathroom Type *" }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            id: "bathrooms",
            name: "bathrooms",
            value: formData.bathrooms,
            onChange: handleInputChange,
            className: errors.bathrooms ? "error" : "",
            children: [
              /* @__PURE__ */ jsx("option", { value: "private", children: "Private" }),
              /* @__PURE__ */ jsx("option", { value: "shared", children: "Shared" })
            ]
          }
        ),
        errors.bathrooms && /* @__PURE__ */ jsx("span", { className: "error-text", children: errors.bathrooms }),
        /* @__PURE__ */ jsx("small", { className: "form-help", children: "Select bathroom type for this apartment" })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "description", children: "Description *" }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            id: "description",
            name: "description",
            value: formData.description,
            onChange: handleInputChange,
            className: errors.description ? "error" : "",
            placeholder: "Describe the apartment, its features, and unique selling points...",
            rows: "4"
          }
        ),
        errors.description && /* @__PURE__ */ jsx("span", { className: "error-text", children: errors.description })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "mapUrl", children: "Google Maps Link" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "url",
            id: "mapUrl",
            name: "mapUrl",
            value: formData.mapUrl,
            onChange: handleInputChange,
            className: errors.mapUrl ? "error" : "",
            placeholder: "e.g., https://maps.google.com/..."
          }
        ),
        errors.mapUrl && /* @__PURE__ */ jsx("span", { className: "error-text", children: errors.mapUrl }),
        /* @__PURE__ */ jsx("small", { className: "form-help", children: "Optional: Paste the Google Maps link for the apartment location" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "contactNumber", children: "Contact Number *" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "tel",
            id: "contactNumber",
            name: "contactNumber",
            value: formData.contactNumber,
            onChange: handleInputChange,
            className: errors.contactNumber ? "error" : "",
            placeholder: "e.g., +201012345678 or 01012345678"
          }
        ),
        errors.contactNumber && /* @__PURE__ */ jsx("span", { className: "error-text", children: errors.contactNumber }),
        /* @__PURE__ */ jsx("div", { className: "contact-hint", children: "This number will be used for WhatsApp contact button for inquiries about this apartment." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "photos", children: "Apartment Photos (Optional)" }),
        /* @__PURE__ */ jsxs("div", { className: "photo-upload-container", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "file",
              id: "photos",
              name: "photos",
              multiple: true,
              accept: "image/*",
              onChange: handlePhotoUpload,
              className: "photo-upload-input"
            }
          ),
          /* @__PURE__ */ jsxs("label", { htmlFor: "photos", className: "photo-upload-label", children: [
            /* @__PURE__ */ jsx("div", { className: "upload-icon", children: "🏠" }),
            /* @__PURE__ */ jsxs("div", { className: "upload-text", children: [
              /* @__PURE__ */ jsx("strong", { children: "Click to upload apartment photos (optional)" }),
              /* @__PURE__ */ jsx("span", { children: "or drag and drop" })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "upload-hint", children: "PNG, JPG, GIF up to 10MB each" })
          ] })
        ] }),
        errors.photos && /* @__PURE__ */ jsx("span", { className: "error-text", children: errors.photos }),
        formData.photoFiles.length > 0 && /* @__PURE__ */ jsx("div", { className: "photo-preview-grid", children: formData.photoFiles.map((file, index) => /* @__PURE__ */ jsxs("div", { className: "photo-preview-item", children: [
          /* @__PURE__ */ jsx(
            "img",
            {
              src: URL.createObjectURL(file),
              alt: `Apartment ${index + 1}`,
              className: "photo-preview-image"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: "photo-remove-btn",
              onClick: () => removePhoto(index),
              title: "Remove photo",
              children: "×"
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "photo-name", children: file.name })
        ] }, index)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "facilities", children: "Facilities & Amenities" }),
        /* @__PURE__ */ jsxs("div", { className: "facility-input-section", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: facilityInput,
              onChange: (e) => setFacilityInput(e.target.value),
              onKeyPress: handleFacilityInputKeyPress,
              placeholder: "Type a facility and press Enter",
              className: "facility-input"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => addFacility(facilityInput),
              className: "add-facility-btn",
              children: "Add"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "common-facilities", children: [
          /* @__PURE__ */ jsx("p", { children: "Common facilities:" }),
          /* @__PURE__ */ jsx("div", { className: "facility-suggestions", children: commonFacilities.map((facility) => /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: "facility-suggestion",
              onClick: () => addFacility(facility),
              disabled: formData.facilities.includes(facility),
              children: facility
            },
            facility
          )) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "selected-facilities", children: formData.facilities.map((facility) => /* @__PURE__ */ jsxs("div", { className: "selected-facility", children: [
          /* @__PURE__ */ jsx("span", { children: facility }),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: () => removeFacility(facility),
              className: "remove-facility",
              children: "×"
            }
          )
        ] }, facility)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "modal-actions", children: [
        /* @__PURE__ */ jsx("button", { type: "button", className: "cancel-btn", onClick: onClose, children: "Cancel" }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            className: "submit-btn",
            disabled: isSubmitting,
            children: isSubmitting ? "Adding Apartment..." : "Add Apartment for Sale"
          }
        )
      ] })
    ] })
  ] }) });
};
const MasterAdminDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, logout: logout2, updateProfile } = useMasterAuth();
  const { createAdminAccount: createAdminAccount2, getAllAdminAccounts, deleteAdminAccount: deleteAdminAccount2 } = useAdminAuth();
  const {
    apartments,
    addApartment: addApartment2,
    addStudio: addStudio2,
    saleApartments,
    addSaleApartment: addSaleApartment2,
    fetchRentApartments,
    fetchSaleApartments
  } = usePropertyManagement();
  const [isAddStudioModalOpen, setIsAddStudioModalOpen] = useState(false);
  const [isAddApartmentModalOpen, setIsAddApartmentModalOpen] = useState(false);
  const [isAddSaleApartmentModalOpen, setIsAddSaleApartmentModalOpen] = useState(false);
  const [selectedApartmentId, setSelectedApartmentId] = useState(null);
  const [allAdmins, setAllAdmins] = useState([]);
  const [allStudios, setAllStudios] = useState([]);
  const [loading, setLoading2] = useState(true);
  const hasInitialFetch = useRef(false);
  const isFetching = useRef(false);
  const [selectedAdminFilter, setSelectedAdminFilter] = useState("all");
  const [propertyTypeFilter, setPropertyTypeFilter] = useState("rental");
  const [existingAdmins, setExistingAdmins] = useState([]);
  const [selectedAdminToDelete, setSelectedAdminToDelete] = useState("");
  const [isDeletingAdmin, setIsDeletingAdmin] = useState(false);
  const [deleteAdminMessage, setDeleteAdminMessage] = useState({ type: "", text: "" });
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isManageAdminsModalOpen, setIsManageAdminsModalOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [profileMessage, setProfileMessage] = useState({ type: "", text: "" });
  const [isProfileSubmitting, setIsProfileSubmitting] = useState(false);
  const [editType, setEditType] = useState("email");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [adminForm, setAdminForm] = useState({
    name: "",
    email: "",
    password: "",
    mobile: "",
    role: "studio_rental"
    // Default role
  });
  const [adminErrors, setAdminErrors] = useState({});
  const [adminMessage, setAdminMessage] = useState({ type: "", text: "" });
  const [isAdminSubmitting, setIsAdminSubmitting] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const fetchAllData = useCallback(async () => {
    if (!currentUser) return;
    setLoading2(true);
    try {
      const timeoutId = setTimeout(() => {
        setLoading2(false);
      }, 1e4);
      let rentResult;
      try {
        rentResult = await Promise.race([
          fetchRentApartments(),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Rent apartments timeout")), 5e3))
        ]);
      } catch (rentError) {
      }
      let saleResult;
      try {
        saleResult = await Promise.race([
          fetchSaleApartments(),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Sale apartments timeout")), 5e3))
        ]);
      } catch (saleError) {
      }
      clearTimeout(timeoutId);
      try {
        const studiosResponse = await Promise.race([
          apartmentPartsApi.getAll(),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Studios timeout")), 5e3))
        ]);
        setAllStudios(studiosResponse || []);
      } catch (studioError) {
        setAllStudios([]);
      }
      try {
        const adminsResult = await Promise.race([
          getAllAdminAccounts(),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Admins timeout")), 5e3))
        ]);
        if (Array.isArray(adminsResult)) {
          setAllAdmins(adminsResult);
          setExistingAdmins(adminsResult);
        } else if ((adminsResult == null ? void 0 : adminsResult.success) && Array.isArray(adminsResult.data)) {
          setAllAdmins(adminsResult.data);
          setExistingAdmins(adminsResult.data);
        } else {
          setAllAdmins([]);
          setExistingAdmins([]);
        }
      } catch (adminError) {
        setAllAdmins([]);
        setExistingAdmins([]);
      }
    } catch (error) {
      setAllAdmins([]);
      setExistingAdmins([]);
      setAllStudios([]);
    } finally {
      setLoading2(false);
      isFetching.current = false;
    }
  }, [currentUser, fetchRentApartments, fetchSaleApartments, getAllAdminAccounts]);
  useEffect(() => {
    if (!currentUser || hasInitialFetch.current || isFetching.current) {
      if (!currentUser) {
        setLoading2(false);
      }
      return;
    }
    isFetching.current = true;
    hasInitialFetch.current = true;
    fetchAllData();
    const emergencyTimeout = setTimeout(() => {
      setLoading2(false);
      isFetching.current = false;
    }, 15e3);
    return () => {
      clearTimeout(emergencyTimeout);
      isFetching.current = false;
    };
  }, []);
  const apartmentsWithStudios = useMemo(() => {
    if (!apartments || apartments.length === 0 || !allStudios) {
      return apartments || [];
    }
    return apartments.map((apartment) => {
      const apartmentStudios = allStudios.filter((studio) => studio.apartment_id === apartment.id).map((studio) => ({
        id: studio.id,
        apartmentId: studio.apartment_id,
        studioNumber: studio.studio_number,
        title: studio.title || `Studio ${studio.studio_number}`,
        unitNumber: studio.studio_number,
        rentValue: parseFloat(studio.monthly_price) || parseFloat(studio.rent_value) || 0,
        price: `${parseFloat(studio.monthly_price) || parseFloat(studio.rent_value) || 0} EGP/month`,
        area: `${parseFloat(studio.area) || 0} sq ft`,
        floor: `Floor ${studio.floor || "N/A"}`,
        bedrooms: studio.bedrooms || 1,
        bathrooms: studio.bathrooms || "private",
        furnished: studio.furnished || "no",
        balcony: studio.balcony || "no",
        description: studio.description || "",
        images: studio.photos_url || [],
        status: studio.status,
        isAvailable: studio.status === "available",
        createdBy: studio.created_by_admin_id,
        createdAt: studio.created_at
      }));
      return {
        ...apartment,
        studios: apartmentStudios,
        totalStudios: apartment.total_parts || apartmentStudios.length
      };
    });
  }, [apartments, allStudios]);
  const filteredProperties = useMemo(() => {
    let properties = propertyTypeFilter === "rental" ? apartmentsWithStudios : saleApartments;
    if (selectedAdminFilter !== "all") {
      properties = properties.filter(
        (property) => property.listed_by_admin_id === parseInt(selectedAdminFilter) || property.createdBy === parseInt(selectedAdminFilter)
      );
    }
    return properties;
  }, [apartmentsWithStudios, saleApartments, propertyTypeFilter, selectedAdminFilter]);
  const handleLogout = () => {
    logout2();
    navigate("/");
  };
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 4e3);
  };
  const openEditProfileModal = () => {
    setEditType("email");
    setProfileForm({
      email: (currentUser == null ? void 0 : currentUser.email) || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
    setProfileErrors({});
    setProfileMessage({ type: "", text: "" });
    setIsEditProfileModalOpen(true);
  };
  const closeEditProfileModal = () => {
    setIsEditProfileModalOpen(false);
    setEditType("email");
    setProfileForm({
      email: "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
    setProfileErrors({});
    setProfileMessage({ type: "", text: "" });
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };
  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
    if (profileErrors[name]) {
      setProfileErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };
  const validateProfileForm = () => {
    const errors = {};
    if (!profileForm.currentPassword) {
      errors.currentPassword = "Current password is required for verification";
    }
    if (editType === "email") {
      if (!profileForm.email.trim()) {
        errors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(profileForm.email)) {
        errors.email = "Email is invalid";
      }
    } else if (editType === "password") {
      if (!profileForm.newPassword) {
        errors.newPassword = "New password is required";
      } else if (profileForm.newPassword.length < 6) {
        errors.newPassword = "New password must be at least 6 characters";
      }
      if (profileForm.newPassword && profileForm.newPassword !== profileForm.confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
      }
    }
    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!validateProfileForm()) return;
    setIsProfileSubmitting(true);
    setProfileMessage({ type: "", text: "" });
    try {
      if (!currentUser) {
        setProfileMessage({ type: "error", text: "You are not authenticated. Please login again." });
        setIsProfileSubmitting(false);
        return;
      }
      let emailToUpdate = currentUser.email;
      let passwordToUpdate = null;
      if (editType === "email") {
        emailToUpdate = profileForm.email;
        passwordToUpdate = null;
      } else if (editType === "password") {
        emailToUpdate = currentUser.email;
        passwordToUpdate = profileForm.newPassword;
      }
      const updateData = {
        email: emailToUpdate,
        currentPassword: profileForm.currentPassword,
        newPassword: passwordToUpdate
      };
      const result = await updateProfile(updateData);
      if (result.success) {
        const successMessage = editType === "email" ? "Email updated successfully! Redirecting to login..." : "Password updated successfully! Redirecting to login...";
        setProfileMessage({
          type: "success",
          text: successMessage
        });
        setTimeout(() => {
          logout2();
          navigate("/auth/master-admin-login");
        }, 2e3);
      } else {
        setProfileMessage({
          type: "error",
          text: result.message || "Failed to update profile. Please try again."
        });
      }
    } catch (error) {
      setProfileMessage({ type: "error", text: "Failed to update profile. Please try again." });
    } finally {
      setIsProfileSubmitting(false);
    }
  };
  const openManageAdminsModal = async () => {
    try {
      const adminsResponse = await getAllAdminAccounts();
      if (adminsResponse && Array.isArray(adminsResponse)) {
        setAllAdmins(adminsResponse);
        setExistingAdmins(adminsResponse);
      } else {
        setAllAdmins([]);
        setExistingAdmins([]);
      }
    } catch (error) {
      showToast("Failed to load admin list. Please try again.", "error");
      return;
    }
    setAdminForm({
      name: "",
      email: "",
      password: "",
      mobile: "",
      role: "studio_rental"
    });
    setAdminErrors({});
    setAdminMessage({ type: "", text: "" });
    setIsManageAdminsModalOpen(true);
  };
  const closeManageAdminsModal = () => {
    setIsManageAdminsModalOpen(false);
    setAdminForm({
      name: "",
      email: "",
      password: "",
      mobile: "",
      role: "studio_rental"
      // Reset to default role when closing modal
    });
    setAdminErrors({});
    setAdminMessage({ type: "", text: "" });
    setShowAdminPassword(false);
  };
  const handleAdminInputChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    if (name === "mobile") {
      processedValue = value.replace(/\D/g, "");
      if (processedValue.length > 11) {
        processedValue = processedValue.slice(0, 11);
      }
    }
    setAdminForm((prev) => ({ ...prev, [name]: processedValue }));
    if (adminErrors[name]) {
      setAdminErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };
  const validateAdminForm = () => {
    var _a, _b, _c, _d;
    const errors = {};
    if (!((_a = adminForm.name) == null ? void 0 : _a.trim())) {
      errors.name = "Name is required";
    }
    if (!((_b = adminForm.email) == null ? void 0 : _b.trim())) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(adminForm.email)) {
      errors.email = "Email is invalid";
    }
    if (!((_c = adminForm.password) == null ? void 0 : _c.trim())) {
      errors.password = "Password is required";
    } else if (adminForm.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    if (!((_d = adminForm.mobile) == null ? void 0 : _d.trim())) {
      errors.mobile = "Mobile number is required";
    } else {
      const cleanedMobile = adminForm.mobile.replace(/\s/g, "");
      if (!/^(010|011|012|015)\d{8}$/.test(cleanedMobile)) {
        errors.mobile = "Must be 11 digits starting with 010, 011, 012, or 015 (e.g., 01012345678)";
      }
    }
    if (!adminForm.role) {
      errors.role = "Please select a valid admin role";
    }
    setAdminErrors(errors);
    return Object.keys(errors).length === 0;
  };
  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    if (!validateAdminForm()) {
      return;
    }
    let freshAdmins = [];
    try {
      freshAdmins = await getAllAdminAccounts() || [];
    } catch (error) {
      freshAdmins = existingAdmins;
    }
    const emailToCheck = adminForm.email.toLowerCase().trim();
    const existingAdminWithEmail = freshAdmins.find(
      (admin) => {
        var _a;
        return ((_a = admin.email) == null ? void 0 : _a.toLowerCase()) === emailToCheck;
      }
    );
    if (existingAdminWithEmail) {
      const errorMsg = `This email is already registered. An admin account with "${adminForm.email}" already exists. Please use a different email address.`;
      setAdminMessage({ type: "error", text: errorMsg });
      showToast(errorMsg, "error");
      setIsAdminSubmitting(false);
      return;
    }
    const phoneToCheck = formatPhoneForAPI(adminForm.mobile.trim());
    const existingAdminWithPhone = freshAdmins.find((admin) => {
      const adminPhone = admin.phone || admin.mobile || admin.mobileNumber || "";
      return adminPhone === phoneToCheck;
    });
    if (existingAdminWithPhone) {
      const errorMsg = `This phone number is already registered. An admin account with "${adminForm.mobile}" already exists. Please use a different phone number.`;
      setAdminMessage({ type: "error", text: errorMsg });
      showToast(errorMsg, "error");
      setIsAdminSubmitting(false);
      return;
    }
    setIsAdminSubmitting(true);
    setAdminMessage({ type: "", text: "" });
    try {
      const apiData = {
        full_name: adminForm.name.trim(),
        email: adminForm.email.toLowerCase().trim(),
        phone: formatPhoneForAPI(adminForm.mobile.trim()),
        password: adminForm.password.trim(),
        role: adminForm.role
      };
      const response = await createAdminAccount2(apiData);
      if (response.success) {
        showToast("Admin created successfully!", "success");
        setAdminForm({
          name: "",
          email: "",
          password: "",
          mobile: "",
          role: "studio_rental"
        });
        setAdminErrors({});
        setAdminMessage({ type: "", text: "" });
        const adminsResponse = await getAllAdminAccounts();
        if (adminsResponse && Array.isArray(adminsResponse)) {
          setAllAdmins(adminsResponse);
          setExistingAdmins(adminsResponse);
        } else {
        }
        setTimeout(() => {
          closeManageAdminsModal();
        }, 2e3);
      } else {
        let errorMsg = response.error || response.message || "Failed to create admin account. Please try again.";
        if (errorMsg.toLowerCase().includes("already") || errorMsg.toLowerCase().includes("exists") || errorMsg.toLowerCase().includes("duplicate")) {
          try {
            const freshAdmins2 = await getAllAdminAccounts();
            if (freshAdmins2 && Array.isArray(freshAdmins2)) {
              const matchingEmail = freshAdmins2.find((a) => {
                const adminEmail = (a.email || a.account || "").toLowerCase();
                const searchEmail = apiData.email.toLowerCase();
                return adminEmail === searchEmail;
              });
              const matchingPhone = freshAdmins2.find((a) => {
                const adminPhone = a.phone || a.mobile || a.mobileNumber || "";
                return adminPhone === apiData.phone;
              });
              if (matchingEmail && matchingPhone && matchingEmail.id === matchingPhone.id) {
                errorMsg = `Backend detected a duplicate but it's not showing in our admin list. This might be a database sync issue. Tried to create: Email: ${apiData.email} • Phone: ${apiData.phone}. Try refreshing the page or use completely different values.`;
              } else if (matchingEmail) {
                errorMsg = `Backend detected a duplicate but it's not showing in our admin list. This might be a database sync issue. Tried to create: Email: ${apiData.email} • Phone: ${apiData.phone}. Try refreshing the page or use completely different values.`;
              } else if (matchingPhone) {
                errorMsg = `Backend detected a duplicate but it's not showing in our admin list. This might be a database sync issue. Tried to create: Email: ${apiData.email} • Phone: ${apiData.phone}. Try refreshing the page or use completely different values.`;
              } else {
                errorMsg = `Backend detected a duplicate but it's not showing in our admin list. This might be a database sync issue. Tried to create: Email: ${apiData.email} • Phone: ${apiData.phone}. Try refreshing the page or use completely different values.`;
              }
            } else {
              errorMsg = `❌ Backend says duplicate exists but could not fetch admin list to identify the issue.

Please try different email and phone number.`;
            }
          } catch (fetchError) {
            errorMsg = `❌ Backend detected duplicate values but could not verify details.

Please try different email and phone number.`;
          }
        }
        setAdminMessage({
          type: "error",
          text: errorMsg
        });
        showToast(errorMsg, "error");
      }
    } catch (error) {
      const errorMsg = error.message || "Failed to create admin account. Please try again.";
      setAdminMessage({ type: "error", text: errorMsg });
      showToast(errorMsg, "error");
    } finally {
      setIsAdminSubmitting(false);
    }
  };
  const handleDeleteAdmin = async () => {
    var _a;
    if (!selectedAdminToDelete) {
      setDeleteAdminMessage({ type: "error", text: "Please select an admin to delete." });
      return;
    }
    setIsDeletingAdmin(true);
    setDeleteAdminMessage({ type: "", text: "" });
    try {
      const adminToDelete = existingAdmins.find((admin) => admin.id === parseInt(selectedAdminToDelete));
      if (!adminToDelete) {
        setDeleteAdminMessage({ type: "error", text: "Admin not found in the list." });
        setIsDeletingAdmin(false);
        return;
      }
      const response = await deleteAdminAccount2(adminToDelete.id);
      if (response && response.success) {
        setDeleteAdminMessage({
          type: "success",
          text: `Admin "${adminToDelete.full_name || adminToDelete.name}" deleted successfully!`
        });
        showToast("Admin account deleted successfully!", "success");
        const adminsResponse = await getAllAdminAccounts();
        if (adminsResponse) {
          setAllAdmins(adminsResponse);
          setExistingAdmins(adminsResponse);
        }
        setSelectedAdminToDelete("");
        if (selectedAdminFilter === String(adminToDelete.id)) {
          setSelectedAdminFilter("all");
        }
        setTimeout(() => {
          setDeleteAdminMessage({ type: "", text: "" });
        }, 3e3);
      } else {
        setDeleteAdminMessage({
          type: "error",
          text: response && response.error || response && response.message || "Failed to delete admin account."
        });
        showToast("Failed to delete admin account", "error");
      }
    } catch (error) {
      const errorMessage = ((_a = error.data) == null ? void 0 : _a.detail) || error.message || "Failed to delete admin account. Please try again.";
      setDeleteAdminMessage({ type: "error", text: errorMessage });
      showToast(errorMessage, "error");
    } finally {
      setIsDeletingAdmin(false);
    }
  };
  const handleAddStudio = (apartmentId) => {
    setSelectedApartmentId(apartmentId);
    setIsAddStudioModalOpen(true);
  };
  const handleStudioAdded = async (newStudio) => {
    try {
      await addStudio2(newStudio);
      setIsAddStudioModalOpen(false);
      setSelectedApartmentId(null);
    } catch (error) {
    }
  };
  const handleApartmentAdded = async (newApartment) => {
    try {
      if (propertyTypeFilter === "rental") {
        await addApartment2(newApartment);
        setIsAddApartmentModalOpen(false);
      } else {
        await addSaleApartment2(newApartment);
        setIsAddSaleApartmentModalOpen(false);
      }
    } catch (error) {
    }
  };
  const handleSaleApartmentAdded = async (newSaleApartment) => {
    try {
      await addSaleApartment2(newSaleApartment);
      setIsAddSaleApartmentModalOpen(false);
    } catch (error) {
    }
  };
  const statistics = useMemo(() => {
    var _a;
    const totalStudios = (allStudios == null ? void 0 : allStudios.length) || 0;
    const availableStudios = ((_a = allStudios == null ? void 0 : allStudios.filter(
      (studio) => studio.status === "available" || studio.isAvailable
    )) == null ? void 0 : _a.length) || 0;
    return {
      totalApartments: apartments.length,
      totalSaleApartments: saleApartments.length,
      totalStudios,
      availableStudios,
      totalAdmins: allAdmins.length
    };
  }, [allStudios, apartments, saleApartments, allAdmins]);
  if (!currentUser) {
    return null;
  }
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "master-admin-dashboard loading", children: /* @__PURE__ */ jsx("div", { className: "loading-container", children: /* @__PURE__ */ jsx("div", { className: "spinner" }) }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "master-admin-dashboard", children: [
    /* @__PURE__ */ jsxs(
      "section",
      {
        className: "dashboard-hero",
        style: { backgroundImage: `url(${heroImg})` },
        children: [
          /* @__PURE__ */ jsx("div", { className: "dashboard-hero__overlay" }),
          /* @__PURE__ */ jsxs("nav", { className: "dashboard-nav", children: [
            /* @__PURE__ */ jsxs("div", { className: "nav-left", children: [
              /* @__PURE__ */ jsx("img", { src: aygLogo, alt: "AYG Logo", className: "brand-logo" }),
              /* @__PURE__ */ jsx("span", { className: "brand-text", children: "AYG" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "nav-right", children: [
              /* @__PURE__ */ jsxs(
                "button",
                {
                  className: "nav-btn edit-profile-btn",
                  onClick: openEditProfileModal,
                  children: [
                    /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faEdit }),
                    " Edit Profile"
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  className: "nav-btn manage-admins-btn",
                  onClick: openManageAdminsModal,
                  children: [
                    /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faUsers }),
                    " Manage Admins"
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  className: "nav-btn rental-alerts-btn",
                  onClick: () => navigate("/master-admin/rental-alerts"),
                  children: [
                    /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faBell }),
                    " Rental Alerts"
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                "button",
                {
                  className: "nav-btn logout-btn",
                  onClick: handleLogout,
                  children: [
                    /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faSignOutAlt }),
                    " Logout"
                  ]
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "dashboard-hero-content", children: [
            /* @__PURE__ */ jsx("h1", { children: "Master Admin Dashboard" }),
            /* @__PURE__ */ jsxs("div", { className: "dashboard-stats", children: [
              /* @__PURE__ */ jsxs("div", { className: "stat-card", children: [
                /* @__PURE__ */ jsx("div", { className: "stat-number", children: statistics.totalApartments }),
                /* @__PURE__ */ jsx("div", { className: "stat-label", children: "Total Apartments" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "stat-card", children: [
                /* @__PURE__ */ jsx("div", { className: "stat-number", children: statistics.totalStudios }),
                /* @__PURE__ */ jsx("div", { className: "stat-label", children: "Total Studios" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "stat-card", children: [
                /* @__PURE__ */ jsx("div", { className: "stat-number", children: statistics.availableStudios }),
                /* @__PURE__ */ jsx("div", { className: "stat-label", children: "Available Studios" })
              ] })
            ] })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsx("main", { className: "dashboard-main", children: /* @__PURE__ */ jsxs("div", { className: "dashboard-container", children: [
      /* @__PURE__ */ jsxs("div", { className: "dashboard-header", children: [
        /* @__PURE__ */ jsx("h2", { children: "Property Management" }),
        /* @__PURE__ */ jsxs("div", { className: "dashboard-header-buttons", children: [
          /* @__PURE__ */ jsxs("div", { className: "admin-filter-section", children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "property-type-filter", children: "Property Type:" }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                id: "property-type-filter",
                value: propertyTypeFilter,
                onChange: (e) => setPropertyTypeFilter(e.target.value),
                className: "admin-filter-select",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "rental", children: "Rental Apartments" }),
                  /* @__PURE__ */ jsx("option", { value: "sale", children: "Sale Apartments" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "admin-filter-section", children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "admin-filter", children: "Filter by Admin:" }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                id: "admin-filter",
                value: selectedAdminFilter,
                onChange: (e) => setSelectedAdminFilter(e.target.value),
                className: "admin-filter-select",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "all", children: "All Admins" }),
                  existingAdmins.map((admin) => /* @__PURE__ */ jsx("option", { value: admin.id, children: admin.full_name || admin.name || admin.username }, admin.id))
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs(
            "button",
            {
              className: "add-apartment-btn",
              onClick: () => {
                if (propertyTypeFilter === "rental") {
                  setIsAddApartmentModalOpen(true);
                } else {
                  setIsAddSaleApartmentModalOpen(true);
                }
              },
              children: [
                "+ Add New ",
                propertyTypeFilter === "rental" ? "Rental" : "Sale",
                " Apartment"
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "apartments-grid", children: propertyTypeFilter === "rental" ? filteredProperties.map((apartment) => /* @__PURE__ */ jsx(
        ApartmentCard,
        {
          apartment,
          onAddStudio: handleAddStudio
        },
        apartment.id
      )) : filteredProperties.map((apartment) => /* @__PURE__ */ jsx(
        SaleApartmentCard,
        {
          apartment,
          isAdminView: false,
          showCreatedBy: true
        },
        apartment.id
      )) }),
      filteredProperties.length === 0 && /* @__PURE__ */ jsxs("div", { className: "empty-state", children: [
        selectedAdminFilter === "all" ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs("h3", { children: [
            "No ",
            propertyTypeFilter === "rental" ? "rental" : "sale",
            " apartments found"
          ] }),
          /* @__PURE__ */ jsxs("p", { children: [
            "Start by adding your first ",
            propertyTypeFilter === "rental" ? "rental apartment complex" : "apartment for sale"
          ] })
        ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs("h3", { children: [
            "No ",
            propertyTypeFilter === "rental" ? "rental" : "sale",
            " properties found for selected admin"
          ] }),
          /* @__PURE__ */ jsxs("p", { children: [
            "This admin has not created any ",
            propertyTypeFilter === "rental" ? "rental apartments" : "apartments for sale",
            " yet"
          ] })
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            className: "add-apartment-btn",
            onClick: () => {
              if (propertyTypeFilter === "rental") {
                setIsAddApartmentModalOpen(true);
              } else {
                setIsAddSaleApartmentModalOpen(true);
              }
            },
            children: [
              "+ Add First ",
              propertyTypeFilter === "rental" ? "Rental" : "Sale",
              " Apartment"
            ]
          }
        )
      ] })
    ] }) }),
    isAddStudioModalOpen && /* @__PURE__ */ jsx(
      AddStudioModal,
      {
        isOpen: isAddStudioModalOpen,
        apartmentId: selectedApartmentId,
        onStudioAdded: handleStudioAdded,
        onClose: () => {
          setIsAddStudioModalOpen(false);
          setSelectedApartmentId(null);
        }
      }
    ),
    isAddApartmentModalOpen && /* @__PURE__ */ jsx(
      AddApartmentModal,
      {
        isOpen: isAddApartmentModalOpen,
        onApartmentAdded: handleApartmentAdded,
        onClose: () => setIsAddApartmentModalOpen(false)
      }
    ),
    isAddSaleApartmentModalOpen && /* @__PURE__ */ jsx(
      AddSaleApartmentModal,
      {
        isOpen: isAddSaleApartmentModalOpen,
        onApartmentAdded: handleSaleApartmentAdded,
        onClose: () => setIsAddSaleApartmentModalOpen(false)
      }
    ),
    isEditProfileModalOpen && /* @__PURE__ */ jsx("div", { className: "modal-overlay", onClick: closeEditProfileModal, children: /* @__PURE__ */ jsxs("div", { className: "modal-content admin-management-modal", onClick: (e) => e.stopPropagation(), children: [
      /* @__PURE__ */ jsxs("div", { className: "modal-header", children: [
        /* @__PURE__ */ jsx("h2", { children: "Edit Profile" }),
        /* @__PURE__ */ jsx("button", { className: "modal-close-btn", onClick: closeEditProfileModal, children: "×" })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleProfileSubmit, className: "modal-form", children: [
        profileMessage.text && /* @__PURE__ */ jsx("div", { className: `modal-message ${profileMessage.type}`, children: profileMessage.text }),
        /* @__PURE__ */ jsxs("div", { className: "form-section", children: [
          /* @__PURE__ */ jsx("h3", { children: "What would you like to update?" }),
          /* @__PURE__ */ jsx("div", { className: "form-group", children: /* @__PURE__ */ jsxs("div", { className: "choice-buttons", children: [
            /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                className: `choice-btn ${editType === "email" ? "active" : ""}`,
                onClick: () => setEditType("email"),
                children: [
                  /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faEnvelope }),
                  " Update Email"
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                className: `choice-btn ${editType === "password" ? "active" : ""}`,
                onClick: () => setEditType("password"),
                children: [
                  /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faEdit }),
                  " Update Password"
                ]
              }
            )
          ] }) }),
          editType === "email" && /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "email", children: "New Email Address" }),
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "email",
                id: "email",
                name: "email",
                value: profileForm.email,
                onChange: handleProfileInputChange,
                className: profileErrors.email ? "error" : "",
                placeholder: "Enter your new email address"
              }
            ),
            profileErrors.email && /* @__PURE__ */ jsx("span", { className: "error-text", children: profileErrors.email })
          ] }),
          editType === "password" && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "newPassword", children: "New Password" }),
              /* @__PURE__ */ jsxs("div", { className: "password-input-container", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: showNewPassword ? "text" : "password",
                    id: "newPassword",
                    name: "newPassword",
                    value: profileForm.newPassword,
                    onChange: handleProfileInputChange,
                    className: profileErrors.newPassword ? "error" : "",
                    placeholder: "Enter your new password"
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    className: "password-toggle-btn",
                    onClick: () => setShowNewPassword(!showNewPassword),
                    "aria-label": "Toggle password visibility",
                    children: /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: showNewPassword ? faEye : faEyeSlash })
                  }
                )
              ] }),
              profileErrors.newPassword && /* @__PURE__ */ jsx("span", { className: "error-text", children: profileErrors.newPassword })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "confirmPassword", children: "Confirm New Password" }),
              /* @__PURE__ */ jsxs("div", { className: "password-input-container", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: showConfirmPassword ? "text" : "password",
                    id: "confirmPassword",
                    name: "confirmPassword",
                    value: profileForm.confirmPassword,
                    onChange: handleProfileInputChange,
                    className: profileErrors.confirmPassword ? "error" : "",
                    placeholder: "Confirm your new password"
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    className: "password-toggle-btn",
                    onClick: () => setShowConfirmPassword(!showConfirmPassword),
                    "aria-label": "Toggle password visibility",
                    children: /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: showConfirmPassword ? faEye : faEyeSlash })
                  }
                )
              ] }),
              profileErrors.confirmPassword && /* @__PURE__ */ jsx("span", { className: "error-text", children: profileErrors.confirmPassword })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "verification-section", children: [
          /* @__PURE__ */ jsx("h3", { children: "Verification Required" }),
          /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "currentPassword", children: "Enter Current Password to Confirm Changes *" }),
            /* @__PURE__ */ jsxs("div", { className: "password-input-container", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: showCurrentPassword ? "text" : "password",
                  id: "currentPassword",
                  name: "currentPassword",
                  value: profileForm.currentPassword,
                  onChange: handleProfileInputChange,
                  className: profileErrors.currentPassword ? "error" : "",
                  placeholder: "Enter your current password to verify changes",
                  required: true
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  className: "password-toggle-btn",
                  onClick: () => setShowCurrentPassword(!showCurrentPassword),
                  "aria-label": "Toggle password visibility",
                  children: /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: showCurrentPassword ? faEye : faEyeSlash })
                }
              )
            ] }),
            profileErrors.currentPassword && /* @__PURE__ */ jsx("span", { className: "error-text", children: profileErrors.currentPassword })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "modal-actions", children: [
          /* @__PURE__ */ jsx("button", { type: "button", className: "btn-secondary", onClick: closeEditProfileModal, children: "Cancel" }),
          /* @__PURE__ */ jsx("button", { type: "submit", className: "btn-primary", disabled: isProfileSubmitting, children: isProfileSubmitting ? "Updating..." : editType === "email" ? "Update Email" : "Update Password" })
        ] })
      ] })
    ] }) }),
    isManageAdminsModalOpen && /* @__PURE__ */ jsx("div", { className: "modal-overlay", onClick: closeManageAdminsModal, children: /* @__PURE__ */ jsxs("div", { className: "modal-content admin-management-modal", onClick: (e) => e.stopPropagation(), children: [
      /* @__PURE__ */ jsxs("div", { className: "modal-header", children: [
        /* @__PURE__ */ jsx("h2", { children: "Manage Admin Accounts" }),
        /* @__PURE__ */ jsx("button", { className: "modal-close-btn", onClick: closeManageAdminsModal, children: "×" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "admin-management-content", children: [
        /* @__PURE__ */ jsxs("div", { className: "tab-section", style: { backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "16px", marginBottom: "24px" }, children: [
          /* @__PURE__ */ jsxs("h3", { style: { fontSize: "1.1rem", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }, children: [
            "👥 Existing Admin Accounts (",
            existingAdmins.length,
            ")",
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: async () => {
                  try {
                    const freshAdmins = await getAllAdminAccounts();
                    setAllAdmins(freshAdmins);
                    setExistingAdmins(freshAdmins);
                    showToast("Admin list refreshed!", "success");
                  } catch (error) {
                    showToast("Failed to refresh admin list", "error");
                  }
                },
                style: {
                  padding: "4px 12px",
                  fontSize: "0.85rem",
                  backgroundColor: "#3b82f6",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  marginLeft: "auto"
                },
                children: "🔄 Refresh"
              }
            )
          ] }),
          existingAdmins.length === 0 ? /* @__PURE__ */ jsx("p", { style: { color: "#6b7280", fontSize: "0.9rem", margin: "8px 0" }, children: "No admins found. Create the first admin below." }) : /* @__PURE__ */ jsx("div", { style: { maxHeight: "200px", overflowY: "auto" }, children: /* @__PURE__ */ jsxs("table", { style: { width: "100%", fontSize: "0.85rem", borderCollapse: "collapse" }, children: [
            /* @__PURE__ */ jsx("thead", { style: { position: "sticky", top: 0, backgroundColor: "#f9fafb", borderBottom: "2px solid #e5e7eb" }, children: /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("th", { style: { padding: "8px", textAlign: "left", fontWeight: "600" }, children: "Name" }),
              /* @__PURE__ */ jsx("th", { style: { padding: "8px", textAlign: "left", fontWeight: "600" }, children: "Email" }),
              /* @__PURE__ */ jsx("th", { style: { padding: "8px", textAlign: "left", fontWeight: "600" }, children: "Phone" }),
              /* @__PURE__ */ jsx("th", { style: { padding: "8px", textAlign: "left", fontWeight: "600" }, children: "Role" })
            ] }) }),
            /* @__PURE__ */ jsx("tbody", { children: existingAdmins.map((admin) => /* @__PURE__ */ jsxs("tr", { style: { borderBottom: "1px solid #e5e7eb" }, children: [
              /* @__PURE__ */ jsx("td", { style: { padding: "8px" }, children: admin.full_name || admin.name || admin.username || "N/A" }),
              /* @__PURE__ */ jsx("td", { style: { padding: "8px", color: "#3b82f6" }, children: admin.email }),
              /* @__PURE__ */ jsx("td", { style: { padding: "8px", color: "#10b981" }, children: admin.phone || admin.mobile || admin.mobileNumber || "N/A" }),
              /* @__PURE__ */ jsx("td", { style: { padding: "8px" }, children: /* @__PURE__ */ jsx("span", { style: {
                padding: "2px 8px",
                borderRadius: "4px",
                fontSize: "0.75rem",
                backgroundColor: admin.role === "super_admin" ? "#fef3c7" : "#dbeafe",
                color: admin.role === "super_admin" ? "#92400e" : "#1e40af"
              }, children: admin.role === "super_admin" ? "★ Super Admin" : admin.role === "studio_rental" ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faBuilding }),
                " Studio Rental"
              ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faHome }),
                " Apt Sales"
              ] }) }) })
            ] }, admin.id)) })
          ] }) }),
          /* @__PURE__ */ jsxs("p", { style: { color: "#6b7280", fontSize: "0.8rem", marginTop: "8px", fontStyle: "italic" }, children: [
            /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faInfoCircle }),
            " Make sure to use unique email and phone number when creating new admin"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "tab-section", children: [
          /* @__PURE__ */ jsx("h3", { children: "Create New Admin" }),
          /* @__PURE__ */ jsxs("form", { onSubmit: handleAdminSubmit, className: "modal-form", children: [
            adminMessage.text && /* @__PURE__ */ jsx("div", { className: `modal-message ${adminMessage.type}`, children: adminMessage.text }),
            /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "name", style: { paddingTop: "250px" }, children: "Full Name" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  id: "name",
                  name: "name",
                  value: adminForm.name,
                  onChange: handleAdminInputChange,
                  className: adminErrors.name ? "error" : "",
                  placeholder: "Enter admin's full name"
                }
              ),
              adminErrors.name && /* @__PURE__ */ jsx("span", { className: "error-text", children: adminErrors.name })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "email", children: "Email Address" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "email",
                  id: "email",
                  name: "email",
                  value: adminForm.email,
                  onChange: handleAdminInputChange,
                  onBlur: (e) => {
                    const emailValue = e.target.value.toLowerCase().trim();
                    if (!emailValue) return;
                    const matchingAdmin = existingAdmins.find((a) => {
                      const adminEmail = (a.email || a.account || "").toLowerCase();
                      return adminEmail === emailValue;
                    });
                    if (matchingAdmin) {
                      setAdminErrors((prev) => ({
                        ...prev,
                        email: `⚠️ Email already used by: ${matchingAdmin.full_name || matchingAdmin.name || "existing admin"}`
                      }));
                    } else {
                      setAdminErrors((prev) => {
                        const newErrors = { ...prev };
                        delete newErrors.email;
                        return newErrors;
                      });
                    }
                  },
                  className: adminErrors.email ? "error" : "",
                  placeholder: "Enter admin's email (must be unique)"
                }
              ),
              adminErrors.email && /* @__PURE__ */ jsx("span", { className: "error-text", children: adminErrors.email }),
              adminForm.email && !adminErrors.email && existingAdmins.length > 0 && /* @__PURE__ */ jsxs("small", { style: { color: "#10b981", fontSize: "0.85rem", display: "block", marginTop: "4px" }, children: [
                /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faCheckCircle }),
                " Email is available"
              ] }),
              adminForm.email && !adminErrors.email && existingAdmins.length === 0 && /* @__PURE__ */ jsxs("small", { style: { color: "#f59e0b", fontSize: "0.85rem", display: "block", marginTop: "4px" }, children: [
                /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faExclamationTriangle }),
                " Unable to verify - admin list not loaded"
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "password", children: "Password" }),
              /* @__PURE__ */ jsxs("div", { className: "password-input-container", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: showAdminPassword ? "text" : "password",
                    id: "password",
                    name: "password",
                    value: adminForm.password,
                    onChange: handleAdminInputChange,
                    className: adminErrors.password ? "error" : "",
                    placeholder: "Enter admin's password"
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    className: "password-toggle-btn",
                    onClick: () => setShowAdminPassword(!showAdminPassword),
                    "aria-label": "Toggle password visibility",
                    children: /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: showAdminPassword ? faEye : faEyeSlash })
                  }
                )
              ] }),
              adminErrors.password && /* @__PURE__ */ jsx("span", { className: "error-text", children: adminErrors.password })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "mobile", children: "Mobile Phone (11 digits)" }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  id: "mobile",
                  name: "mobile",
                  value: adminForm.mobile,
                  onChange: handleAdminInputChange,
                  onBlur: (e) => {
                    const phoneValue = e.target.value.trim();
                    if (!phoneValue) return;
                    if (/^(010|011|012|015)\d{8}$/.test(phoneValue)) {
                      const formattedPhone = formatPhoneForAPI(phoneValue);
                      const matchingAdmin = existingAdmins.find(
                        (a) => (a.phone || a.mobile || a.mobileNumber) === formattedPhone
                      );
                      if (matchingAdmin) {
                        setAdminErrors((prev) => ({
                          ...prev,
                          mobile: `⚠️ Phone already used by: ${matchingAdmin.full_name || matchingAdmin.name}`
                        }));
                      } else {
                        setAdminErrors((prev) => {
                          const newErrors = { ...prev };
                          delete newErrors.mobile;
                          return newErrors;
                        });
                      }
                    }
                  },
                  className: adminErrors.mobile ? "error" : "",
                  placeholder: "01012345678 (must be unique)",
                  maxLength: "11",
                  inputMode: "numeric",
                  pattern: "[0-9]*"
                }
              ),
              adminErrors.mobile && /* @__PURE__ */ jsx("span", { className: "error-text", children: adminErrors.mobile }),
              !adminErrors.mobile && adminForm.mobile && /^(010|011|012|015)\d{8}$/.test(adminForm.mobile) && existingAdmins.length > 0 && /* @__PURE__ */ jsxs("small", { style: { color: "#10b981", fontSize: "0.85rem", display: "block", marginTop: "4px" }, children: [
                /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faCheckCircle }),
                " Phone number is valid and available"
              ] }),
              !adminErrors.mobile && adminForm.mobile && /^(010|011|012|015)\d{8}$/.test(adminForm.mobile) && existingAdmins.length === 0 && /* @__PURE__ */ jsxs("small", { style: { color: "#f59e0b", fontSize: "0.85rem", display: "block", marginTop: "4px" }, children: [
                /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faExclamationTriangle }),
                " Unable to verify - admin list not loaded"
              ] }),
              !adminErrors.mobile && (!adminForm.mobile || !/^(010|011|012|015)\d{8}$/.test(adminForm.mobile)) && /* @__PURE__ */ jsx("small", { className: "field-hint", style: { color: "#6b7280", fontSize: "0.85rem", display: "block", marginTop: "4px" }, children: "Enter 11 digits starting with 010, 011, 012, or 015" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "role", children: "Admin Role" }),
              /* @__PURE__ */ jsxs(
                "select",
                {
                  id: "role",
                  name: "role",
                  value: adminForm.role,
                  onChange: handleAdminInputChange,
                  className: adminErrors.role ? "error" : "",
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "studio_rental", children: "Studio Rental Manager" }),
                    /* @__PURE__ */ jsx("option", { value: "apartment_sale", children: "Apartment Sales Manager" })
                  ]
                }
              ),
              adminErrors.role && /* @__PURE__ */ jsx("span", { className: "error-text", children: adminErrors.role }),
              /* @__PURE__ */ jsx("small", { className: "field-description", children: "Studio Rental Managers can manage studio rentals, while Apartment Sales Managers can list apartments for sale." })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "modal-actions", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  className: "btn-secondary",
                  onClick: () => {
                    setAdminForm({
                      name: "",
                      email: "",
                      password: "",
                      mobile: "",
                      role: "studio_rental"
                    });
                    setAdminErrors({});
                    setAdminMessage({ type: "", text: "" });
                    showToast("Form cleared!", "success");
                  },
                  children: "🗑️ Clear Form"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  className: "btn-secondary",
                  onClick: async () => {
                    try {
                      const freshAdmins = await getAllAdminAccounts();
                      setAllAdmins(freshAdmins);
                      setExistingAdmins(freshAdmins);
                      showToast("Admin list refreshed!", "success");
                    } catch (error) {
                      showToast("Failed to refresh admin list", "error");
                    }
                  },
                  children: "🔄 Refresh List"
                }
              ),
              /* @__PURE__ */ jsx("button", { type: "submit", className: "btn-primary", disabled: isAdminSubmitting, children: isAdminSubmitting ? "Creating..." : "Create Admin" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "tab-section delete-admin-section", children: [
          /* @__PURE__ */ jsx("h3", { children: "Delete Admin Account" }),
          deleteAdminMessage.text && /* @__PURE__ */ jsx("div", { className: `modal-message ${deleteAdminMessage.type}`, children: deleteAdminMessage.text }),
          /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "admin-to-delete", children: "Select Admin to Delete" }),
            /* @__PURE__ */ jsxs(
              "select",
              {
                id: "admin-to-delete",
                value: selectedAdminToDelete,
                onChange: (e) => {
                  setSelectedAdminToDelete(e.target.value);
                },
                className: "admin-select",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "", children: "-- Select Admin --" }),
                  existingAdmins.map((admin) => /* @__PURE__ */ jsx("option", { value: admin.id, children: admin.full_name || admin.name || admin.username }, admin.id))
                ]
              }
            ),
            existingAdmins.length === 0 && /* @__PURE__ */ jsx("small", { className: "field-hint", style: { color: "#6b7280", fontSize: "0.85rem", display: "block", marginTop: "4px" }, children: "No admins available to delete. Create an admin first." })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "modal-actions", children: /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: "btn-danger",
              onClick: handleDeleteAdmin,
              disabled: isDeletingAdmin || !selectedAdminToDelete,
              style: {
                opacity: isDeletingAdmin || !selectedAdminToDelete ? 0.5 : 1,
                cursor: isDeletingAdmin || !selectedAdminToDelete ? "not-allowed" : "pointer"
              },
              children: isDeletingAdmin ? "Deleting..." : "Delete Admin"
            }
          ) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "modal-actions main-actions", children: /* @__PURE__ */ jsx("button", { type: "button", className: "btn-secondary", onClick: closeManageAdminsModal, children: "Close" }) })
      ] })
    ] }) }),
    toast.show && /* @__PURE__ */ jsx("div", { className: `toast toast-${toast.type}`, children: /* @__PURE__ */ jsxs("div", { className: "toast-content", children: [
      /* @__PURE__ */ jsx("span", { className: "toast-icon", children: /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: toast.type === "success" ? faCheckCircle : faTimesCircle }) }),
      /* @__PURE__ */ jsx("span", { className: "toast-message", children: toast.message })
    ] }) })
  ] });
};
const ReportsPage = () => {
  var _a, _b, _c, _d, _e, _f;
  const navigate = useNavigate();
  const { currentUser, logout: logout2 } = useMasterAuth();
  const { apartments, saleApartments } = useProperty();
  const { getAllAdmins } = useAdminAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [admins, setAdmins2] = useState([]);
  const [adminStats, setAdminStats] = useState([]);
  const [overallStats, setOverallStats] = useState({});
  const [selectedTimeRange, setSelectedTimeRange] = useState("all");
  const [sortBy, setSortBy] = useState("totalProperties");
  const { showInfo } = useToast();
  const loadReportsData = useCallback(async () => {
    setIsLoading(true);
    try {
      const adminsList = getAllAdmins();
      setAdmins2(adminsList);
      const statsData = adminsList.map((admin) => {
        const adminApartments = apartments.filter(
          (apt) => apt.createdBy === admin.email || apt.createdBy === admin.id || apt.createdBy === admin.accountOrMobile
        );
        const adminStudios = adminApartments.reduce(
          (total, apt) => total + (apt.studios ? apt.studios.length : 0),
          0
        );
        const availableStudios = adminApartments.reduce(
          (total, apt) => total + (apt.studios ? apt.studios.filter((studio) => studio.isAvailable).length : 0),
          0
        );
        const rentedStudios = adminStudios - availableStudios;
        const estimatedRevenue = adminApartments.reduce((total, apt) => {
          if (!apt.studios) return total;
          return total + apt.studios.reduce((studioTotal, studio) => {
            if (!studio.isAvailable && studio.pricePerMonth) {
              return studioTotal + studio.pricePerMonth;
            }
            return studioTotal;
          }, 0);
        }, 0);
        const occupancyRate = adminStudios > 0 ? rentedStudios / adminStudios * 100 : 0;
        const performanceScore = Math.round(occupancyRate * 0.7 + adminApartments.length * 5 + adminStudios * 2);
        return {
          admin,
          totalApartments: adminApartments.length,
          totalStudios: adminStudios,
          availableStudios,
          rentedStudios,
          occupancyRate: occupancyRate.toFixed(1),
          estimatedRevenue,
          performanceScore,
          joinedDate: admin.createdAt || "Unknown",
          lastActivity: admin.lastLogin || "Unknown"
        };
      });
      const sortedStats = sortStats(statsData, sortBy);
      setAdminStats(sortedStats);
      const overall = {
        totalAdmins: adminsList.length,
        totalApartments: apartments.length,
        totalStudios: apartments.reduce((total, apt) => total + (apt.studios ? apt.studios.length : 0), 0),
        totalAvailable: apartments.reduce(
          (total, apt) => total + (apt.studios ? apt.studios.filter((studio) => studio.isAvailable).length : 0),
          0
        ),
        totalRented: apartments.reduce(
          (total, apt) => total + (apt.studios ? apt.studios.filter((studio) => !studio.isAvailable).length : 0),
          0
        ),
        totalRevenue: statsData.reduce((total, stat) => total + stat.estimatedRevenue, 0),
        averageOccupancy: statsData.length > 0 ? (statsData.reduce((total, stat) => total + parseFloat(stat.occupancyRate), 0) / statsData.length).toFixed(1) : 0
      };
      setOverallStats(overall);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  }, [getAllAdmins, apartments, saleApartments]);
  useEffect(() => {
    if (!currentUser) {
      navigate("/auth/master-admin-login");
      return;
    }
    loadReportsData();
  }, [currentUser, navigate, loadReportsData]);
  const sortStats = (data, criteria) => {
    return [...data].sort((a, b) => {
      switch (criteria) {
        case "totalProperties":
          return b.totalApartments + b.totalStudios - (a.totalApartments + a.totalStudios);
        case "revenue":
          return b.estimatedRevenue - a.estimatedRevenue;
        case "performance":
          return b.performanceScore - a.performanceScore;
        case "occupancy":
          return parseFloat(b.occupancyRate) - parseFloat(a.occupancyRate);
        default:
          return b.performanceScore - a.performanceScore;
      }
    });
  };
  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
    const sortedStats = sortStats(adminStats, newSortBy);
    setAdminStats(sortedStats);
  };
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-EG", {
      style: "currency",
      currency: "EGP",
      minimumFractionDigits: 0
    }).format(amount);
  };
  const getPerformanceColor = (score) => {
    if (score >= 80) return "#22c55e";
    if (score >= 60) return "#f59e0b";
    if (score >= 40) return "#f97316";
    return "#ef4444";
  };
  const getOccupancyColor = (rate) => {
    const numRate = parseFloat(rate);
    if (numRate >= 80) return "#22c55e";
    if (numRate >= 60) return "#f59e0b";
    if (numRate >= 40) return "#f97316";
    return "#ef4444";
  };
  if (isLoading) {
    return /* @__PURE__ */ jsx("div", { className: "reports-loading", children: /* @__PURE__ */ jsx(LoadingSpinner, { size: "large", color: "primary" }) });
  }
  return /* @__PURE__ */ jsxs("main", { className: "reports-page", children: [
    /* @__PURE__ */ jsxs(
      "section",
      {
        className: "reports-hero",
        style: { backgroundImage: `url(${heroImg})` },
        children: [
          /* @__PURE__ */ jsx("div", { className: "reports-hero__overlay" }),
          /* @__PURE__ */ jsxs("nav", { className: "reports-nav", children: [
            /* @__PURE__ */ jsx(
              BackButton,
              {
                text: "← Back",
                variant: "transparent"
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "brand", children: /* @__PURE__ */ jsx("img", { src: aygLogo, alt: "AYG Logo", className: "brand-logo" }) }),
            /* @__PURE__ */ jsx("div", { className: "nav-actions", children: /* @__PURE__ */ jsx(
              "button",
              {
                className: "logout-btn",
                onClick: () => {
                  logout2();
                  navigate("/");
                },
                children: "Logout"
              }
            ) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "reports-hero__inner", children: [
            /* @__PURE__ */ jsx("h1", { className: "reports-title", children: "Admin Tracking & Reports" }),
            /* @__PURE__ */ jsx("p", { className: "reports-subtitle", children: "Monitor admin performance and property management analytics with comprehensive insights into occupancy rates, revenue generation, and property portfolio growth." })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsx("section", { className: "overall-stats", children: /* @__PURE__ */ jsxs("div", { className: "stats-container", children: [
      /* @__PURE__ */ jsx("h2", { className: "section-title", children: "Overall Performance" }),
      /* @__PURE__ */ jsxs("div", { className: "stats-grid", children: [
        /* @__PURE__ */ jsx("div", { className: "stat-card primary", children: /* @__PURE__ */ jsxs("div", { className: "stat-content", children: [
          /* @__PURE__ */ jsx("div", { className: "stat-number", children: overallStats.totalAdmins }),
          /* @__PURE__ */ jsx("div", { className: "stat-label", children: "Active Admins" })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "stat-card info", children: /* @__PURE__ */ jsxs("div", { className: "stat-content", children: [
          /* @__PURE__ */ jsx("div", { className: "stat-number", children: overallStats.totalApartments }),
          /* @__PURE__ */ jsx("div", { className: "stat-label", children: "Total Apartments" })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "stat-card success", children: /* @__PURE__ */ jsxs("div", { className: "stat-content", children: [
          /* @__PURE__ */ jsx("div", { className: "stat-number", children: overallStats.totalStudios }),
          /* @__PURE__ */ jsx("div", { className: "stat-label", children: "Total Studios" })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "stat-card warning", children: /* @__PURE__ */ jsxs("div", { className: "stat-content", children: [
          /* @__PURE__ */ jsx("div", { className: "stat-number", children: overallStats.totalAvailable }),
          /* @__PURE__ */ jsx("div", { className: "stat-label", children: "Available" })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "stat-card danger", children: /* @__PURE__ */ jsxs("div", { className: "stat-content", children: [
          /* @__PURE__ */ jsx("div", { className: "stat-number", children: overallStats.totalRented }),
          /* @__PURE__ */ jsx("div", { className: "stat-label", children: "Rented" })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "stat-card revenue", children: /* @__PURE__ */ jsxs("div", { className: "stat-content", children: [
          /* @__PURE__ */ jsx("div", { className: "stat-number", children: formatCurrency(overallStats.totalRevenue) }),
          /* @__PURE__ */ jsx("div", { className: "stat-label", children: "Monthly Revenue" })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "stat-card occupancy", children: /* @__PURE__ */ jsxs("div", { className: "stat-content", children: [
          /* @__PURE__ */ jsxs("div", { className: "stat-number", children: [
            overallStats.averageOccupancy,
            "%"
          ] }),
          /* @__PURE__ */ jsx("div", { className: "stat-label", children: "Avg Occupancy" })
        ] }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("section", { className: "reports-controls", children: /* @__PURE__ */ jsxs("div", { className: "controls-container", children: [
      /* @__PURE__ */ jsx("div", { className: "controls-left", children: /* @__PURE__ */ jsx("h2", { className: "section-title", children: "Admin Performance Details" }) }),
      /* @__PURE__ */ jsxs("div", { className: "controls-right", children: [
        /* @__PURE__ */ jsxs("div", { className: "filter-group", children: [
          /* @__PURE__ */ jsx("label", { children: "Sort by:" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: sortBy,
              onChange: (e) => handleSortChange(e.target.value),
              className: "sort-select",
              children: [
                /* @__PURE__ */ jsx("option", { value: "performance", children: "Performance Score" }),
                /* @__PURE__ */ jsx("option", { value: "totalProperties", children: "Total Properties" }),
                /* @__PURE__ */ jsx("option", { value: "revenue", children: "Revenue" }),
                /* @__PURE__ */ jsx("option", { value: "occupancy", children: "Occupancy Rate" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "btn btn--primary refresh-btn",
            onClick: loadReportsData,
            children: "🔄 Refresh Data"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("section", { className: "admin-stats-section", children: /* @__PURE__ */ jsx("div", { className: "admin-stats-container", children: adminStats.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "no-data", children: [
      /* @__PURE__ */ jsx("h3", { children: "No admin data available" }),
      /* @__PURE__ */ jsx("p", { children: "No admins have been created yet or no properties have been added." })
    ] }) : /* @__PURE__ */ jsx("div", { className: "table-wrapper", children: /* @__PURE__ */ jsxs("table", { className: "stats-table", children: [
      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("th", { children: "Admin" }),
        /* @__PURE__ */ jsx("th", { children: "Apartments" }),
        /* @__PURE__ */ jsx("th", { children: "Studios" }),
        /* @__PURE__ */ jsx("th", { children: "Available" }),
        /* @__PURE__ */ jsx("th", { children: "Rented" }),
        /* @__PURE__ */ jsx("th", { children: "Occupancy" }),
        /* @__PURE__ */ jsx("th", { children: "Revenue" }),
        /* @__PURE__ */ jsx("th", { children: "Performance" }),
        /* @__PURE__ */ jsx("th", { children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsx("tbody", { children: adminStats.map((stat, index) => {
        var _a2;
        return /* @__PURE__ */ jsxs("tr", { className: "admin-row", children: [
          /* @__PURE__ */ jsxs("td", { className: "admin-info", children: [
            /* @__PURE__ */ jsx("div", { className: "admin-avatar", children: (stat.admin.name || stat.admin.email).charAt(0).toUpperCase() }),
            /* @__PURE__ */ jsxs("div", { className: "admin-details", children: [
              /* @__PURE__ */ jsx("div", { className: "admin-name", children: stat.admin.name || ((_a2 = stat.admin.email) == null ? void 0 : _a2.split("@")[0]) }),
              /* @__PURE__ */ jsx("div", { className: "admin-email", children: stat.admin.email }),
              /* @__PURE__ */ jsxs("div", { className: "admin-joined", children: [
                "Joined: ",
                stat.joinedDate !== "Unknown" ? new Date(stat.joinedDate).toLocaleDateString() : "Unknown"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsxs("div", { className: "number-cell", children: [
            /* @__PURE__ */ jsx("span", { className: "main-number", children: stat.totalApartments }),
            /* @__PURE__ */ jsx("span", { className: "sub-text", children: "apartments" })
          ] }) }),
          /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsxs("div", { className: "number-cell", children: [
            /* @__PURE__ */ jsx("span", { className: "main-number", children: stat.totalStudios }),
            /* @__PURE__ */ jsx("span", { className: "sub-text", children: "studios" })
          ] }) }),
          /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsxs("div", { className: "number-cell available", children: [
            /* @__PURE__ */ jsx("span", { className: "main-number", children: stat.availableStudios }),
            /* @__PURE__ */ jsx("span", { className: "sub-text", children: "available" })
          ] }) }),
          /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsxs("div", { className: "number-cell rented", children: [
            /* @__PURE__ */ jsx("span", { className: "main-number", children: stat.rentedStudios }),
            /* @__PURE__ */ jsx("span", { className: "sub-text", children: "rented" })
          ] }) }),
          /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsxs(
            "div",
            {
              className: "occupancy-cell",
              style: { color: getOccupancyColor(stat.occupancyRate) },
              children: [
                /* @__PURE__ */ jsxs("span", { className: "occupancy-rate", children: [
                  stat.occupancyRate,
                  "%"
                ] }),
                /* @__PURE__ */ jsx("div", { className: "occupancy-bar", children: /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: "occupancy-fill",
                    style: {
                      width: `${stat.occupancyRate}%`,
                      backgroundColor: getOccupancyColor(stat.occupancyRate)
                    }
                  }
                ) })
              ]
            }
          ) }),
          /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsxs("div", { className: "revenue-cell", children: [
            /* @__PURE__ */ jsx("span", { className: "revenue-amount", children: formatCurrency(stat.estimatedRevenue) }),
            /* @__PURE__ */ jsx("span", { className: "revenue-period", children: "/ month" })
          ] }) }),
          /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsxs("div", { className: "performance-cell", children: [
            /* @__PURE__ */ jsx(
              "div",
              {
                className: "performance-score",
                style: { color: getPerformanceColor(stat.performanceScore) },
                children: stat.performanceScore
              }
            ),
            /* @__PURE__ */ jsx("div", { className: "performance-badge", children: stat.performanceScore >= 80 ? "🏆 Excellent" : stat.performanceScore >= 60 ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faStar }),
              " Good"
            ] }) : stat.performanceScore >= 40 ? "📈 Average" : "📉 Needs Improvement" })
          ] }) }),
          /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("div", { className: "action-buttons", children: /* @__PURE__ */ jsxs(
            "button",
            {
              className: "view-details-btn",
              onClick: () => {
                showInfo(`Detailed view for ${stat.admin.name || stat.admin.email} coming soon!`);
              },
              children: [
                /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faEye }),
                " View Details"
              ]
            }
          ) }) })
        ] }, stat.admin.id || stat.admin.email);
      }) })
    ] }) }) }) }),
    adminStats.length > 0 && /* @__PURE__ */ jsx("section", { className: "performance-insights", children: /* @__PURE__ */ jsxs("div", { className: "insights-container", children: [
      /* @__PURE__ */ jsx("h2", { className: "section-title", children: "Performance Insights" }),
      /* @__PURE__ */ jsxs("div", { className: "insights-grid", children: [
        /* @__PURE__ */ jsxs("div", { className: "insight-card", children: [
          /* @__PURE__ */ jsx("h3", { children: "🏆 Top Performer" }),
          /* @__PURE__ */ jsxs("div", { className: "insight-content", children: [
            /* @__PURE__ */ jsx("div", { className: "performer-name", children: ((_a = adminStats[0]) == null ? void 0 : _a.admin.name) || ((_c = (_b = adminStats[0]) == null ? void 0 : _b.admin.email) == null ? void 0 : _c.split("@")[0]) }),
            /* @__PURE__ */ jsxs("div", { className: "performer-stats", children: [
              (_d = adminStats[0]) == null ? void 0 : _d.totalApartments,
              " apartments, ",
              (_e = adminStats[0]) == null ? void 0 : _e.totalStudios,
              " studios"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "performer-score", children: [
              "Performance Score: ",
              (_f = adminStats[0]) == null ? void 0 : _f.performanceScore
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "insight-card", children: [
          /* @__PURE__ */ jsxs("h3", { children: [
            /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faChartBar }),
            " Occupancy Leader"
          ] }),
          /* @__PURE__ */ jsx("div", { className: "insight-content", children: (() => {
            var _a2;
            const bestOccupancy = adminStats.reduce(
              (best, current) => parseFloat(current.occupancyRate) > parseFloat(best.occupancyRate) ? current : best
            );
            return /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("div", { className: "performer-name", children: (bestOccupancy == null ? void 0 : bestOccupancy.admin.name) || ((_a2 = bestOccupancy == null ? void 0 : bestOccupancy.admin.email) == null ? void 0 : _a2.split("@")[0]) }),
              /* @__PURE__ */ jsxs("div", { className: "performer-stats", children: [
                bestOccupancy == null ? void 0 : bestOccupancy.occupancyRate,
                "% occupancy rate"
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "performer-score", children: [
                bestOccupancy == null ? void 0 : bestOccupancy.rentedStudios,
                " of ",
                bestOccupancy == null ? void 0 : bestOccupancy.totalStudios,
                " studios rented"
              ] })
            ] });
          })() })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "insight-card", children: [
          /* @__PURE__ */ jsxs("h3", { children: [
            /* @__PURE__ */ jsx(FontAwesomeIcon, { icon: faDollarSign }),
            " Revenue Leader"
          ] }),
          /* @__PURE__ */ jsx("div", { className: "insight-content", children: (() => {
            var _a2;
            const bestRevenue = adminStats.reduce(
              (best, current) => current.estimatedRevenue > best.estimatedRevenue ? current : best
            );
            return /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("div", { className: "performer-name", children: (bestRevenue == null ? void 0 : bestRevenue.admin.name) || ((_a2 = bestRevenue == null ? void 0 : bestRevenue.admin.email) == null ? void 0 : _a2.split("@")[0]) }),
              /* @__PURE__ */ jsxs("div", { className: "performer-stats", children: [
                formatCurrency(bestRevenue == null ? void 0 : bestRevenue.estimatedRevenue),
                " / month"
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "performer-score", children: [
                bestRevenue == null ? void 0 : bestRevenue.rentedStudios,
                " active rentals"
              ] })
            ] });
          })() })
        ] })
      ] })
    ] }) })
  ] });
};
const ProfileEditPage = () => {
  const navigate = useNavigate();
  const { currentUser, updateProfile, logout: logout2, getCurrentUserProfile } = useMasterAuth();
  const userProfile = getCurrentUserProfile();
  const [formData, setFormData] = useState({
    email: (currentUser == null ? void 0 : currentUser.email) || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  useEffect(() => {
    const savedForm = localStorage.getItem("profileEditForm");
    if (savedForm) {
      try {
        const parsed = JSON.parse(savedForm);
        setFormData((prev) => ({
          ...prev,
          email: parsed.email || (currentUser == null ? void 0 : currentUser.email) || ""
          // Don't restore passwords for security
        }));
      } catch (error) {
      }
    }
  }, [currentUser]);
  useEffect(() => {
    const formToSave = {
      email: formData.email
      // Don't save passwords
    };
    localStorage.setItem("profileEditForm", JSON.stringify(formToSave));
  }, [formData.email]);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ""
      }));
    }
  };
  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }
    if (formData.newPassword && formData.newPassword.length < 6) {
      newErrors.newPassword = "New password must be at least 6 characters";
    }
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    setMessage({ type: "", text: "" });
    try {
      const result = await updateProfile(
        formData.email,
        formData.currentPassword,
        formData.newPassword || null
      );
      if (result.success) {
        setMessage({ type: "success", text: result.message + " Redirecting to login..." });
        localStorage.removeItem("profileEditForm");
        setFormData((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        }));
        setTimeout(() => {
          logout2();
          navigate("/master-admin/login");
        }, 2e3);
      } else {
        setMessage({ type: "error", text: result.message });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Update failed. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "profile-edit-page", children: /* @__PURE__ */ jsxs("div", { className: "profile-edit-container", children: [
    /* @__PURE__ */ jsx(BackButton, { text: "← Back" }),
    /* @__PURE__ */ jsxs("header", { className: "profile-header", children: [
      /* @__PURE__ */ jsx("h1", { children: "Edit Profile" }),
      /* @__PURE__ */ jsx("p", { children: "Update your master admin account settings" })
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "profile-form", children: [
      message.text && /* @__PURE__ */ jsx("div", { className: `message ${message.type}`, children: message.text }),
      /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "email", children: "Email Address" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "email",
            id: "email",
            name: "email",
            value: formData.email,
            onChange: handleInputChange,
            className: errors.email ? "error" : "",
            placeholder: "Enter your email"
          }
        ),
        errors.email && /* @__PURE__ */ jsx("span", { className: "error-text", children: errors.email })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "currentPassword", children: "Current Password" }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "password",
            id: "currentPassword",
            name: "currentPassword",
            value: formData.currentPassword,
            onChange: handleInputChange,
            className: errors.currentPassword ? "error" : "",
            placeholder: "Enter current password"
          }
        ),
        errors.currentPassword && /* @__PURE__ */ jsx("span", { className: "error-text", children: errors.currentPassword })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "password-section", children: [
        /* @__PURE__ */ jsx("h3", { children: "Change Password (Optional)" }),
        /* @__PURE__ */ jsx("p", { className: "section-hint", children: "Leave blank if you don't want to change your password" }),
        /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "newPassword", children: "New Password" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "password",
              id: "newPassword",
              name: "newPassword",
              value: formData.newPassword,
              onChange: handleInputChange,
              className: errors.newPassword ? "error" : "",
              placeholder: "Enter new password (optional)"
            }
          ),
          errors.newPassword && /* @__PURE__ */ jsx("span", { className: "error-text", children: errors.newPassword })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "confirmPassword", children: "Confirm New Password" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "password",
              id: "confirmPassword",
              name: "confirmPassword",
              value: formData.confirmPassword,
              onChange: handleInputChange,
              className: errors.confirmPassword ? "error" : "",
              placeholder: "Confirm new password",
              disabled: !formData.newPassword
            }
          ),
          errors.confirmPassword && /* @__PURE__ */ jsx("span", { className: "error-text", children: errors.confirmPassword })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "form-actions", children: /* @__PURE__ */ jsx(
        "button",
        {
          type: "submit",
          className: "update-btn",
          disabled: isSubmitting,
          children: isSubmitting ? "Updating..." : "Update Profile"
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "account-info", children: [
      /* @__PURE__ */ jsx("h3", { children: "Account Information" }),
      /* @__PURE__ */ jsxs("div", { className: "info-grid", children: [
        /* @__PURE__ */ jsxs("div", { className: "info-item", children: [
          /* @__PURE__ */ jsx("label", { children: "Account ID:" }),
          /* @__PURE__ */ jsx("span", { children: (userProfile == null ? void 0 : userProfile.id) || (currentUser == null ? void 0 : currentUser.id) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "info-item", children: [
          /* @__PURE__ */ jsx("label", { children: "Role:" }),
          /* @__PURE__ */ jsx("span", { children: "Master Admin" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "info-item", children: [
          /* @__PURE__ */ jsx("label", { children: "Current Email:" }),
          /* @__PURE__ */ jsx("span", { children: (userProfile == null ? void 0 : userProfile.email) || (currentUser == null ? void 0 : currentUser.email) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "info-item", children: [
          /* @__PURE__ */ jsx("label", { children: "Account Created:" }),
          /* @__PURE__ */ jsx("span", { children: (userProfile == null ? void 0 : userProfile.createdAt) ? new Date(userProfile.createdAt).toLocaleString() : "N/A" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "info-item", children: [
          /* @__PURE__ */ jsx("label", { children: "Last Updated:" }),
          /* @__PURE__ */ jsx("span", { children: (userProfile == null ? void 0 : userProfile.updatedAt) ? new Date(userProfile.updatedAt).toLocaleString() : "Never" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "info-item", children: [
          /* @__PURE__ */ jsx("label", { children: "Login Time:" }),
          /* @__PURE__ */ jsx("span", { children: (userProfile == null ? void 0 : userProfile.loginTime) ? new Date(userProfile.loginTime).toLocaleString() : "N/A" })
        ] })
      ] })
    ] })
  ] }) });
};
const InfiniteScrollTable = ({
  data = [],
  columns = [],
  renderRow,
  itemsPerPage = 10,
  emptyMessage = "No data available",
  loadingMessage = "",
  className = "",
  dependencies = {}
}) => {
  const {
    displayedItems,
    hasMore,
    isLoading,
    loadMore,
    totalItems,
    displayedCount,
    progress
  } = useInfiniteScroll(data, itemsPerPage, dependencies);
  if (data.length === 0) {
    return /* @__PURE__ */ jsx("div", { className: `infinite-scroll-table empty ${className}`, children: /* @__PURE__ */ jsx("div", { className: "empty-state", children: /* @__PURE__ */ jsx("p", { children: emptyMessage }) }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: `infinite-scroll-table ${className}`, children: [
    totalItems > itemsPerPage && /* @__PURE__ */ jsxs("div", { className: "progress-bar", children: [
      /* @__PURE__ */ jsx("div", { className: "progress-fill", style: { width: `${progress}%` } }),
      /* @__PURE__ */ jsxs("span", { className: "progress-text", children: [
        "Showing ",
        displayedCount,
        " of ",
        totalItems,
        " items"
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "table-container", children: /* @__PURE__ */ jsxs("table", { className: "admin-table", children: [
      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { children: columns.map((column, index) => /* @__PURE__ */ jsx("th", { className: column.className || "", children: column.title }, index)) }) }),
      /* @__PURE__ */ jsx("tbody", { children: displayedItems.map((item, index) => /* @__PURE__ */ jsx("tr", { className: "table-row", children: renderRow(item, index) }, item.id || index)) })
    ] }) }),
    isLoading && /* @__PURE__ */ jsxs("div", { className: "loading-more", children: [
      /* @__PURE__ */ jsx(LoadingSpinner, { size: "small" }),
      /* @__PURE__ */ jsx("span", { children: loadingMessage })
    ] }),
    hasMore && !isLoading && /* @__PURE__ */ jsx("div", { className: "load-more-container", children: /* @__PURE__ */ jsxs("button", { onClick: loadMore, className: "load-more-btn", children: [
      "Load More (",
      totalItems - displayedCount,
      " remaining)"
    ] }) }),
    !hasMore && displayedCount > 0 && /* @__PURE__ */ jsx("div", { className: "end-message", children: /* @__PURE__ */ jsxs("p", { children: [
      "All ",
      totalItems,
      " items loaded"
    ] }) })
  ] });
};
const AdminManagementPage = () => {
  const {
    createAdminAccount: createAdminAccount2,
    getAllAdminAccounts,
    updateAdminStatus: updateAdminStatus2,
    deleteAdminAccount: deleteAdminAccount2
  } = useAdminAuth();
  const [adminAccounts, setAdminAccounts] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [formData, setFormData] = useState({
    username: "",
    account: "",
    password: "",
    mobileNumber: ""
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const loadAdminAccounts = useCallback(async () => {
    try {
      const accounts = await getAllAdminAccounts();
      setAdminAccounts(accounts);
    } catch (error) {
      setAdminAccounts([]);
    }
  }, [getAllAdminAccounts]);
  useEffect(() => {
    loadAdminAccounts();
  }, [loadAdminAccounts]);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ""
      }));
    }
  };
  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }
    if (!formData.account.trim()) {
      newErrors.account = "Account is required";
    } else if (formData.account.length < 3) {
      newErrors.account = "Account must be at least 3 characters";
    }
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = "Mobile number is required";
    } else if (!/^[+]?[\d\s-()]+$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = "Invalid mobile number format";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    setMessage({ type: "", text: "" });
    try {
      const result = await createAdminAccount2(formData);
      if (result.success) {
        setMessage({ type: "success", text: result.message });
        setFormData({
          username: "",
          account: "",
          password: "",
          mobileNumber: ""
        });
        setShowCreateForm(false);
        loadAdminAccounts();
      } else {
        setMessage({ type: "error", text: result.message });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to create admin account" });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleToggleStatus = async (adminId, currentStatus) => {
    const success = updateAdminStatus2(adminId, !currentStatus);
    if (success) {
      loadAdminAccounts();
      setMessage({
        type: "success",
        text: `Admin account ${!currentStatus ? "activated" : "deactivated"} successfully`
      });
    } else {
      setMessage({ type: "error", text: "Failed to update admin status" });
    }
  };
  const handleDeleteAdmin = async (adminId) => {
    if (confirmDeleteId !== adminId) {
      setConfirmDeleteId(adminId);
      return;
    }
    setConfirmDeleteId(null);
    const success = deleteAdminAccount2(adminId);
    if (success) {
      loadAdminAccounts();
      setMessage({ type: "success", text: "Admin account deleted successfully" });
    } else {
      setMessage({ type: "error", text: "Failed to delete admin account" });
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "admin-management-page", children: /* @__PURE__ */ jsxs("div", { className: "admin-management-container", children: [
    /* @__PURE__ */ jsx(BackButton, { text: "← Back" }),
    /* @__PURE__ */ jsxs("header", { className: "page-header", children: [
      /* @__PURE__ */ jsx("h1", { children: "Admin Management" }),
      /* @__PURE__ */ jsx("p", { children: "Create and manage admin accounts" }),
      /* @__PURE__ */ jsx(
        "button",
        {
          className: "create-admin-btn",
          onClick: () => setShowCreateForm(true),
          children: "+ Create New Admin"
        }
      )
    ] }),
    message.text && /* @__PURE__ */ jsx("div", { className: `message ${message.type}`, children: message.text }),
    showCreateForm && /* @__PURE__ */ jsx("div", { className: "modal-overlay", children: /* @__PURE__ */ jsxs("div", { className: "modal-content", children: [
      /* @__PURE__ */ jsxs("div", { className: "modal-header", children: [
        /* @__PURE__ */ jsx("h2", { children: "Create New Admin Account" }),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "close-btn",
            onClick: () => setShowCreateForm(false),
            children: "×"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "create-form", children: [
        /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "username", children: "Username" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              id: "username",
              name: "username",
              value: formData.username,
              onChange: handleInputChange,
              className: errors.username ? "error" : "",
              placeholder: "Enter username"
            }
          ),
          errors.username && /* @__PURE__ */ jsx("span", { className: "error-text", children: errors.username })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "account", children: "Account" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              id: "account",
              name: "account",
              value: formData.account,
              onChange: handleInputChange,
              className: errors.account ? "error" : "",
              placeholder: "Enter account name"
            }
          ),
          errors.account && /* @__PURE__ */ jsx("span", { className: "error-text", children: errors.account })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "password", children: "Password" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "password",
              id: "password",
              name: "password",
              value: formData.password,
              onChange: handleInputChange,
              className: errors.password ? "error" : "",
              placeholder: "Enter password"
            }
          ),
          errors.password && /* @__PURE__ */ jsx("span", { className: "error-text", children: errors.password })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "form-group", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "mobileNumber", children: "Mobile Number" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "tel",
              id: "mobileNumber",
              name: "mobileNumber",
              value: formData.mobileNumber,
              onChange: handleInputChange,
              className: errors.mobileNumber ? "error" : "",
              placeholder: "Enter mobile number"
            }
          ),
          errors.mobileNumber && /* @__PURE__ */ jsx("span", { className: "error-text", children: errors.mobileNumber })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "form-actions", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: "cancel-btn",
              onClick: () => setShowCreateForm(false),
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              className: "submit-btn",
              disabled: isSubmitting,
              children: isSubmitting ? "Creating..." : "Create Admin"
            }
          )
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "admin-table-section", children: [
      /* @__PURE__ */ jsxs("h2", { children: [
        "Admin Accounts (",
        adminAccounts.length,
        ")"
      ] }),
      /* @__PURE__ */ jsx(
        InfiniteScrollTable,
        {
          data: adminAccounts,
          itemsPerPage: 8,
          emptyMessage: "No admin accounts found. Create your first admin account to get started.",
          columns: [
            { title: "Username", className: "username-col" },
            { title: "Account", className: "account-col" },
            { title: "Mobile Number", className: "mobile-col" },
            { title: "Status", className: "status-col" },
            { title: "Created", className: "date-col" },
            { title: "Actions", className: "actions-col" }
          ],
          renderRow: (admin, index) => /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("td", { className: "username-cell", children: admin.username }),
            /* @__PURE__ */ jsx("td", { className: "account-cell", children: admin.account }),
            /* @__PURE__ */ jsx("td", { className: "mobile-cell", children: admin.mobileNumber }),
            /* @__PURE__ */ jsx("td", { className: "status-cell", children: /* @__PURE__ */ jsx("span", { className: `status-badge ${admin.isActive ? "active" : "inactive"}`, children: admin.isActive ? "Active" : "Inactive" }) }),
            /* @__PURE__ */ jsx("td", { className: "date-cell", children: new Date(admin.createdAt).toLocaleDateString() }),
            /* @__PURE__ */ jsx("td", { className: "actions-cell", children: /* @__PURE__ */ jsxs("div", { className: "action-buttons", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  className: `action-btn ${admin.isActive ? "deactivate" : "activate"}`,
                  onClick: () => handleToggleStatus(admin.id, admin.isActive),
                  title: admin.isActive ? "Deactivate" : "Activate",
                  children: admin.isActive ? "🔒" : "🔓"
                }
              ),
              confirmDeleteId === admin.id ? /* @__PURE__ */ jsxs("div", { className: "delete-confirm-inline", children: [
                /* @__PURE__ */ jsx("span", { children: "Confirm?" }),
                /* @__PURE__ */ jsx("button", { className: "action-btn delete confirm-yes-btn", onClick: () => handleDeleteAdmin(admin.id), children: "Yes" }),
                /* @__PURE__ */ jsx("button", { className: "action-btn confirm-no-btn", onClick: () => setConfirmDeleteId(null), children: "No" })
              ] }) : /* @__PURE__ */ jsx(
                "button",
                {
                  className: "action-btn delete",
                  onClick: () => handleDeleteAdmin(admin.id),
                  title: "Delete Admin",
                  children: "🗑️"
                }
              )
            ] }) })
          ] }),
          className: "admin-management-table"
        }
      )
    ] })
  ] }) });
};
const MasterAdminRentalAlertsPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useMasterAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalApartments: 0,
    totalStudios: 0,
    rentedStudios: 0,
    availableStudios: 0
  });
  const fetchAllStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const apartmentsResponse = await rentApartmentsApi.getAll();
      const allApartments = Array.isArray(apartmentsResponse) ? apartmentsResponse : [];
      const studiosResponse = await apartmentPartsApi.getAll();
      const allStudios = Array.isArray(studiosResponse) ? studiosResponse : [];
      const contractsResponse = await rentalContractsApi.getAll({ is_active: true });
      const activeContracts = Array.isArray(contractsResponse) ? contractsResponse : [];
      const rentedStudioIds = new Set(activeContracts.map((contract) => contract.apartment_part_id));
      const rentedStudios = allStudios.filter((studio) => rentedStudioIds.has(studio.id)).length;
      const availableStudios = allStudios.length - rentedStudios;
      setStats({
        totalApartments: allApartments.length,
        totalStudios: allStudios.length,
        rentedStudios,
        availableStudios
      });
    } catch (error) {
      console.error("Failed to fetch statistics:", error);
      setStats({
        totalApartments: 0,
        totalStudios: 0,
        rentedStudios: 0,
        availableStudios: 0
      });
    } finally {
      setIsLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchAllStats();
  }, [fetchAllStats]);
  const handleContractDeleted = () => {
    fetchAllStats();
  };
  if (!currentUser) {
    return /* @__PURE__ */ jsx("div", { className: "master-admin-alerts-loading", children: /* @__PURE__ */ jsx(LoadingSpinner, {}) });
  }
  if (isLoading) {
    return /* @__PURE__ */ jsx("div", { className: "master-admin-alerts-loading", children: /* @__PURE__ */ jsx(LoadingSpinner, {}) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "master-admin-rental-alerts-page", children: [
    /* @__PURE__ */ jsx("div", { className: "master-alerts-hero", style: { backgroundImage: `url(${heroImg})` }, children: /* @__PURE__ */ jsx("div", { className: "master-alerts-hero-overlay", children: /* @__PURE__ */ jsxs("div", { className: "master-alerts-hero-content", children: [
      /* @__PURE__ */ jsxs("nav", { className: "master-alerts-nav", children: [
        /* @__PURE__ */ jsx("div", { className: "master-alerts-nav-actions", children: /* @__PURE__ */ jsx(
          BackButton,
          {
            text: "← Back to Master Admin Dashboard",
            onClick: () => navigate("/master-admin/dashboard"),
            variant: "transparent"
          }
        ) }),
        /* @__PURE__ */ jsxs("div", { className: "master-alerts-brand", children: [
          /* @__PURE__ */ jsx("img", { src: aygLogo, alt: "AYG Logo", className: "brand-logo" }),
          /* @__PURE__ */ jsx("span", { className: "brand-text", children: "AYG" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "master-alerts-page-header", children: [
        /* @__PURE__ */ jsxs("h2", { className: "master-alerts-title", children: [
          "Rental ",
          /* @__PURE__ */ jsx("span", { className: "accent", children: "Alerts" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "master-alerts-subtitle", children: "Monitor all rental expirations across the entire system" }),
        /* @__PURE__ */ jsxs("div", { className: "master-alerts-stats", children: [
          /* @__PURE__ */ jsxs("div", { className: "stat-card", children: [
            /* @__PURE__ */ jsx("div", { className: "stat-number", children: stats.totalApartments }),
            /* @__PURE__ */ jsx("div", { className: "stat-label", children: "Apartments" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "stat-card", children: [
            /* @__PURE__ */ jsx("div", { className: "stat-number", children: stats.totalStudios }),
            /* @__PURE__ */ jsx("div", { className: "stat-label", children: "Total Studios" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "stat-card", children: [
            /* @__PURE__ */ jsx("div", { className: "stat-number", children: stats.rentedStudios }),
            /* @__PURE__ */ jsx("div", { className: "stat-label", children: "Rented" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "stat-card", children: [
            /* @__PURE__ */ jsx("div", { className: "stat-number", children: stats.availableStudios }),
            /* @__PURE__ */ jsx("div", { className: "stat-label", children: "Available" })
          ] })
        ] })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsx("div", { className: "master-alerts-main-section", children: /* @__PURE__ */ jsxs("div", { className: "master-alerts-container", children: [
      /* @__PURE__ */ jsxs("div", { className: "master-alerts-section-header", children: [
        /* @__PURE__ */ jsx("h3", { children: "🔔 Active Rental Alerts" }),
        /* @__PURE__ */ jsx("p", { children: "All rental contracts requiring attention across the system" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "master-alerts-content", children: /* @__PURE__ */ jsx(
        RentalAlerts,
        {
          showAllAdmins: true,
          onContractDeleted: handleContractDeleted,
          navigationSource: "master-admin-rental-alerts"
        }
      ) })
    ] }) })
  ] });
};
const ProtectedRoute = ({ children, requireMasterAdmin = true }) => {
  const { currentUser, isLoading } = useMasterAuth();
  const location = useLocation();
  const masterAuthInitialized = useSelector((state) => {
    var _a;
    return (_a = state.masterAuth) == null ? void 0 : _a.initialized;
  });
  const [initializationComplete, setInitializationComplete] = useState(false);
  useEffect(() => {
    if (masterAuthInitialized) {
      const timer = setTimeout(() => {
        setInitializationComplete(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [masterAuthInitialized]);
  if (isLoading || !initializationComplete) {
    return /* @__PURE__ */ jsx("div", { style: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      backgroundColor: "#f5f5f5"
    }, children: /* @__PURE__ */ jsx(LoadingSpinner, {}) });
  }
  if (!currentUser && requireMasterAdmin) {
    const redirectUrl = `/master-admin/login?from=protected&path=${encodeURIComponent(location.pathname)}`;
    return /* @__PURE__ */ jsx(Navigate, { to: redirectUrl, replace: true });
  }
  return children;
};
const AdminProtectedRoute = ({ children }) => {
  const { currentAdmin, isLoading, initializeAdminAuth } = useAdminAuth$1();
  const location = useLocation();
  const [isInitializing, setIsInitializing] = useState(true);
  const [initializationAttempted, setInitializationAttempted] = useState(false);
  useEffect(() => {
    const initAuth = async () => {
      if (initializationAttempted) {
        return;
      }
      setInitializationAttempted(true);
      try {
        const hasToken = authApi.isAuthenticated();
        if (hasToken && !currentAdmin) {
          const result = await initializeAdminAuth();
          if (result.success) {
          } else {
          }
        } else if (!hasToken) {
        } else {
        }
      } catch (error) {
      } finally {
        setTimeout(() => {
          setIsInitializing(false);
        }, 100);
      }
    };
    initAuth();
  }, [initializeAdminAuth, currentAdmin, initializationAttempted]);
  if (isInitializing || isLoading) {
    return /* @__PURE__ */ jsx("div", { style: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      backgroundColor: "#f5f5f5"
    }, children: /* @__PURE__ */ jsx(LoadingSpinner, {}) });
  }
  if (!currentAdmin) {
    const redirectUrl = `/admin/login?from=protected&path=${encodeURIComponent(location.pathname)}`;
    return /* @__PURE__ */ jsx(Navigate, { to: redirectUrl, replace: true });
  }
  return children;
};
var define_process_env_default = { NODE_ENV: "production" };
const SEO_BASE_URL = typeof window !== "undefined" && window.location.origin || define_process_env_default.VITE_SITE_URL || "http://localhost:3000";
function Seo({
  title,
  description,
  canonicalPath = "/",
  image = "/AYG.png",
  noIndex = false,
  structuredData
}) {
  const canonical = `${SEO_BASE_URL}${canonicalPath}`;
  const imageUrl = image.startsWith("http") ? image : `${SEO_BASE_URL}${image}`;
  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }
    document.title = title;
    const setMeta = (name, content, property = false) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let tag = document.head.querySelector(selector);
      if (!tag) {
        tag = document.createElement("meta");
        if (property) {
          tag.setAttribute("property", name);
        } else {
          tag.setAttribute("name", name);
        }
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };
    const setCanonical = (href) => {
      let link = document.head.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }
      link.setAttribute("href", href);
    };
    setMeta("description", description);
    setMeta("og:title", title, true);
    setMeta("og:description", description, true);
    setMeta("og:type", "website", true);
    setMeta("og:url", canonical, true);
    setMeta("og:image", imageUrl, true);
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);
    setMeta("twitter:image", imageUrl);
    setMeta("robots", noIndex ? "noindex,nofollow" : "index,follow");
    setCanonical(canonical);
    const scriptId = "route-structured-data";
    const previousScript = document.getElementById(scriptId);
    if (previousScript) {
      previousScript.remove();
    }
    if (structuredData) {
      const scriptTag = document.createElement("script");
      scriptTag.id = scriptId;
      scriptTag.type = "application/ld+json";
      scriptTag.text = JSON.stringify(structuredData);
      document.head.appendChild(scriptTag);
    }
  }, [title, description, canonical, imageUrl, noIndex, structuredData]);
  return null;
}
const websiteStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "AYG",
  url: SEO_BASE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: `${SEO_BASE_URL}/studios`,
    "query-input": "required name=search_term_string"
  }
};
function AppContent({ RouterComponent, routerProps }) {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(detectSystemTheme());
    dispatch(initializeMasterAuth());
    const initAdminAuth = async () => {
      const { initializeAdminAuth } = await Promise.resolve().then(() => useAdminAuth$2);
      localStorage.getItem("api_access_token");
    };
    initAdminAuth();
  }, [dispatch]);
  return /* @__PURE__ */ jsx(ErrorBoundary, { showDetails: define_process_env_default.NODE_ENV === "development", children: /* @__PURE__ */ jsx(ToastProvider, { children: /* @__PURE__ */ jsx(RouterComponent, { ...routerProps, children: /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs(Routes, { children: [
    /* @__PURE__ */ jsx(
      Route,
      {
        path: "/",
        element: /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(
            Seo,
            {
              title: "AYG",
              description: "Find furnished studios for rent and apartments for sale in Maadi and Mokattam with AYG Real Estate.",
              canonicalPath: "/",
              structuredData: websiteStructuredData
            }
          ),
          /* @__PURE__ */ jsx(LandingPage, {})
        ] })
      }
    ),
    /* @__PURE__ */ jsx(
      Route,
      {
        path: "/studios",
        element: /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(
            Seo,
            {
              title: "Studios For Rent In Cairo",
              description: "Browse available studios for rent with verified amenities, photos, and pricing details.",
              canonicalPath: "/studios"
            }
          ),
          /* @__PURE__ */ jsx(StudiosListPage, {})
        ] })
      }
    ),
    /* @__PURE__ */ jsx(
      Route,
      {
        path: "/studio/:id",
        element: /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(
            Seo,
            {
              title: "Studio Details | AYG",
              description: "View full studio details including location, furnishing, and rent terms.",
              canonicalPath: "/studios"
            }
          ),
          /* @__PURE__ */ jsx(StudioDetailsPage, {})
        ] })
      }
    ),
    /* @__PURE__ */ jsx(
      Route,
      {
        path: "/buy-apartments",
        element: /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(
            Seo,
            {
              title: "Apartments For Sale In Cairo",
              description: "Explore apartments for sale with up-to-date prices and neighborhood highlights.",
              canonicalPath: "/buy-apartments"
            }
          ),
          /* @__PURE__ */ jsx(BuyApartmentPage, {})
        ] })
      }
    ),
    /* @__PURE__ */ jsx(
      Route,
      {
        path: "/apartment-sale/:id",
        element: /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(
            Seo,
            {
              title: "Apartment Sale Details | AYG",
              description: "Check apartment sale details, photos, and location information before booking a visit.",
              canonicalPath: "/buy-apartments"
            }
          ),
          /* @__PURE__ */ jsx(ApartmentSaleDetailsPage$1, {})
        ] })
      }
    ),
    /* @__PURE__ */ jsx(
      Route,
      {
        path: "/admin",
        element: /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Seo, { title: "Admin | AYG", description: "Admin dashboard", noIndex: true }),
          /* @__PURE__ */ jsx(AdminLanding, {})
        ] })
      }
    ),
    /* @__PURE__ */ jsx(
      Route,
      {
        path: "/admin/login",
        element: /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Seo, { title: "Admin Login | AYG", description: "Admin sign in", noIndex: true }),
          /* @__PURE__ */ jsx(AdminLoginPage, {})
        ] })
      }
    ),
    /* @__PURE__ */ jsx(
      Route,
      {
        path: "/admin/dashboard",
        element: /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Seo, { title: "Admin Dashboard | AYG", description: "Admin dashboard", noIndex: true }),
          /* @__PURE__ */ jsx(AdminProtectedRoute, { children: /* @__PURE__ */ jsx(AdminDashboard, {}) })
        ] })
      }
    ),
    /* @__PURE__ */ jsx(
      Route,
      {
        path: "/admin/rental-alerts",
        element: /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Seo, { title: "Admin Alerts | AYG", description: "Admin rental alerts", noIndex: true }),
          /* @__PURE__ */ jsx(AdminProtectedRoute, { children: /* @__PURE__ */ jsx(RentalAlertsPage, {}) })
        ] })
      }
    ),
    /* @__PURE__ */ jsx(
      Route,
      {
        path: "/admin/apartment-sale/:id",
        element: /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Seo, { title: "Admin Sale Details | AYG", description: "Admin sale details", noIndex: true }),
          /* @__PURE__ */ jsx(ApartmentSaleDetailsPage, {})
        ] })
      }
    ),
    /* @__PURE__ */ jsx(
      Route,
      {
        path: "/apartment/:id",
        element: /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Seo, { title: "Apartment Details | AYG", description: "Apartment detail page", noIndex: true }),
          /* @__PURE__ */ jsx(ApartmentDetailPage, {})
        ] })
      }
    ),
    /* @__PURE__ */ jsx(
      Route,
      {
        path: "/master-admin/login",
        element: /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Seo, { title: "Master Admin Login | AYG", description: "Master admin sign in", noIndex: true }),
          /* @__PURE__ */ jsx(MasterAdminLoginForm, {})
        ] })
      }
    ),
    /* @__PURE__ */ jsx(Route, { path: "/master-admin", element: /* @__PURE__ */ jsx(Navigate, { to: "/master-admin/login", replace: true }) }),
    /* @__PURE__ */ jsx(
      Route,
      {
        path: "/master-admin/dashboard",
        element: /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Seo, { title: "Master Dashboard | AYG", description: "Master admin dashboard", noIndex: true }),
          /* @__PURE__ */ jsx(ProtectedRoute, { children: /* @__PURE__ */ jsx(MasterAdminDashboard, {}) })
        ] })
      }
    ),
    /* @__PURE__ */ jsx(
      Route,
      {
        path: "/master-admin/reports",
        element: /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Seo, { title: "Master Reports | AYG", description: "Master admin reports", noIndex: true }),
          /* @__PURE__ */ jsx(ProtectedRoute, { children: /* @__PURE__ */ jsx(ReportsPage, {}) })
        ] })
      }
    ),
    /* @__PURE__ */ jsx(
      Route,
      {
        path: "/master-admin/profile",
        element: /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Seo, { title: "Master Profile | AYG", description: "Master admin profile", noIndex: true }),
          /* @__PURE__ */ jsx(ProtectedRoute, { children: /* @__PURE__ */ jsx(ProfileEditPage, {}) })
        ] })
      }
    ),
    /* @__PURE__ */ jsx(
      Route,
      {
        path: "/master-admin/manage-admins",
        element: /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Seo, { title: "Manage Admins | AYG", description: "Master admin management", noIndex: true }),
          /* @__PURE__ */ jsx(ProtectedRoute, { children: /* @__PURE__ */ jsx(AdminManagementPage, {}) })
        ] })
      }
    ),
    /* @__PURE__ */ jsx(
      Route,
      {
        path: "/master-admin/rental-alerts",
        element: /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Seo, { title: "Master Alerts | AYG", description: "Master admin alerts", noIndex: true }),
          /* @__PURE__ */ jsx(ProtectedRoute, { children: /* @__PURE__ */ jsx(MasterAdminRentalAlertsPage, {}) })
        ] })
      }
    )
  ] }) }) }) }) });
}
function App({
  RouterComponent = BrowserRouter,
  routerProps = {},
  dehydratedState
}) {
  const queryClient = useMemo(
    () => new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 6e4,
          gcTime: 5 * 6e4,
          retry: 1
        }
      }
    }),
    []
  );
  return /* @__PURE__ */ jsx(Provider, { store, children: /* @__PURE__ */ jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsx(HydrationBoundary, { state: dehydratedState, children: /* @__PURE__ */ jsx(AppContent, { RouterComponent, routerProps }) }) }) });
}
async function render(url) {
  const appHtml = renderToString(
    /* @__PURE__ */ jsx(
      App,
      {
        RouterComponent: StaticRouter,
        routerProps: { location: url },
        dehydratedState: null
      }
    )
  );
  return {
    appHtml,
    dehydratedState: null
  };
}
export {
  render
};
