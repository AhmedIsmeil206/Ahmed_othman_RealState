/**
 * AO Real Estate API Service
 * Handles all backend communication with JWT authentication
 * Configuration loaded from environment variables
 */

// API Configuration from environment variables only
const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/v1',
  TIMEOUT: parseInt(process.env.REACT_APP_API_TIMEOUT) || 10000,
  HEADERS: {
    'Content-Type': 'application/json'
  },
  ENVIRONMENT: process.env.REACT_APP_ENVIRONMENT || 'development',
  ENABLE_LOGGING: process.env.REACT_APP_ENABLE_API_LOGGING === 'true',
  ENABLE_RETRY: process.env.REACT_APP_ENABLE_RETRY_LOGIC !== 'false',
  MAX_RETRIES: parseInt(process.env.REACT_APP_MAX_RETRY_ATTEMPTS) || 3
};

// Token Management
class TokenManager {
  static TOKEN_KEY = process.env.REACT_APP_TOKEN_STORAGE_KEY || 'api_access_token';
  
  static getToken() {
    // Ensure TOKEN_KEY is not null/undefined
    if (!this.TOKEN_KEY) {
      console.warn('TOKEN_KEY is not set, using default');
      this.TOKEN_KEY = 'api_access_token';
    }
    return localStorage.getItem(this.TOKEN_KEY);
  }
  
  static setToken(token) {
    // Ensure TOKEN_KEY is not null/undefined
    if (!this.TOKEN_KEY) {
      console.warn('TOKEN_KEY is not set, using default');
      this.TOKEN_KEY = 'api_access_token';
    }
    localStorage.setItem(this.TOKEN_KEY, token);
    if (API_CONFIG.ENABLE_LOGGING) {
      console.log('Authentication token updated');
    }
  }
  
  static removeToken() {
    // Ensure TOKEN_KEY is not null/undefined
    if (!this.TOKEN_KEY) {
      console.warn('TOKEN_KEY is not set, using default');
      this.TOKEN_KEY = 'api_access_token';
    }
    localStorage.removeItem(this.TOKEN_KEY);
  }
  
  static isAuthenticated() {
    return !!this.getToken();
  }
}

// Validate API Configuration
const validateConfig = () => {
  // Log environment variables status
  if (!process.env.REACT_APP_API_BASE_URL) {
    console.warn('⚠️ REACT_APP_API_BASE_URL not set, using default');
  }
  
  if (!process.env.REACT_APP_ENVIRONMENT) {
    console.warn('⚠️ REACT_APP_ENVIRONMENT not set, using default');
  }
  
  if (!process.env.REACT_APP_TOKEN_STORAGE_KEY) {
    console.warn('⚠️ REACT_APP_TOKEN_STORAGE_KEY not set, using default: api_access_token');
  }
  
  // Ensure valid timeout
  if (isNaN(API_CONFIG.TIMEOUT) || API_CONFIG.TIMEOUT < 1000) {
    console.warn('⚠️ Invalid timeout, setting to 10000ms');
    API_CONFIG.TIMEOUT = 10000;
  }
  
  // Ensure valid max retries
  if (isNaN(API_CONFIG.MAX_RETRIES) || API_CONFIG.MAX_RETRIES < 0) {
    console.warn('⚠️ Invalid max retries, setting to 3');
    API_CONFIG.MAX_RETRIES = 3;
  }
  
  if (API_CONFIG.ENABLE_LOGGING) {
    console.log('✅ API Configuration loaded successfully');
  }
};

// Validate configuration on module load
validateConfig();

// API Constants from backend documentation
export const API_CONSTANTS = {
  ADMIN_ROLES: {
    SUPER_ADMIN: 'super_admin',
    STUDIO_RENTAL: 'studio_rental',
    APARTMENT_SALE: 'apartment_sale'
  },
  LOCATIONS: {
    MAADI: 'maadi',
    MOKKATTAM: 'mokkattam'
  },
  BATHROOM_TYPES: {
    PRIVATE: 'private',
    SHARED: 'shared'
  },
  PART_STATUS: {
    AVAILABLE: 'available',
    RENTED: 'rented',
    UPCOMING_END: 'upcoming_end'
  },
  FURNISHED_STATUS: {
    YES: 'yes',
    NO: 'no'
  },
  BALCONY_TYPES: {
    YES: 'yes',
    SHARED: 'shared',
    NO: 'no'
  },
  CUSTOMER_SOURCES: {
    FACEBOOK: 'facebook',
    INSTAGRAM: 'instagram',
    GOOGLE: 'google',
    REFERRAL: 'referral',
    WALK_IN: 'walk_in',
    OTHER: 'other'
  }
};

// HTTP Client with interceptors
class ApiClient {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  // Create request headers
  createHeaders(includeAuth = true, contentType = 'application/json') {
    const headers = {};
    
    if (contentType) {
      headers['Content-Type'] = contentType;
    }
    
    if (includeAuth && TokenManager.isAuthenticated()) {
      headers['Authorization'] = `Bearer ${TokenManager.getToken()}`;
    }
    
    return headers;
  }

  // Handle API responses
  async handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      
      // Handle different error types
      switch (response.status) {
        case 401:
          TokenManager.removeToken();
          throw new ApiError('Authentication failed', 401, errorData);
        case 403:
          throw new ApiError('Access forbidden', 403, errorData);
        case 404:
          throw new ApiError('Resource not found', 404, errorData);
        case 422:
          throw new ApiError('Validation error', 422, errorData);
        case 500:
          throw new ApiError('Server error', 500, errorData);
        default:
          throw new ApiError('Request failed', response.status, errorData);
      }
    }
    
    return response.json();
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const {
      method = 'GET',
      body,
      headers = {},
      includeAuth = true,
      contentType = 'application/json'
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
      if (contentType === 'application/json') {
        config.body = JSON.stringify(body);
      } else {
        config.body = body;
      }
    }

    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      config.signal = controller.signal;
      
      const response = await fetch(url, config);
      clearTimeout(timeoutId);
      
      return await this.handleResponse(response);
    } catch (error) {
      // Log network errors but don't use mock data
      if (error.name === 'AbortError') {
        console.error('❌ Request timeout - Backend server took too long to respond');
        throw new ApiError('Request timeout', 408, { detail: 'Request timed out' });
      } else if (error.message === 'Failed to fetch' || error.message.includes('fetch')) {
        console.error('❌ Backend connection failed');
        console.error('Please ensure your backend server is running and accessible.');
        throw new ApiError('Network error', 0, { detail: 'Failed to connect to backend server' });
      }
      
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Network error', 0, { detail: error.message });
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
      method: 'POST',
      body: data,
      ...options
    });
  }

  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: data
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    });
  }
}

// Custom API Error class
export class ApiError extends Error {
  constructor(message, status, data = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }

  getDetails() {
    return this.data?.detail || this.message;
  }

  getValidationErrors() {
    if (this.status === 422 && Array.isArray(this.data?.detail)) {
      return this.data.detail.map(error => ({
        field: error.loc?.[error.loc.length - 1],
        message: error.msg,
        type: error.type
      }));
    }
    return [];
  }
}

// Create API client instance
const apiClient = new ApiClient();

// Authentication API
export const authApi = {
  // Login with username/password (form data)
  async login(username, password) {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await apiClient.post('/auth/login', formData, {
      contentType: 'application/x-www-form-urlencoded',
      includeAuth: false
    });

    if (response.access_token) {
      TokenManager.setToken(response.access_token);
    }

    return response;
  },

  // Create master admin (one-time setup)
  async createMasterAdmin(data) {
    return apiClient.post('/auth/create-master-admin', data, {
      includeAuth: false
    });
  },

  // Check if master admin exists
  async checkMasterAdminExists() {
    return apiClient.get('/auth/check-master-admin', {
      includeAuth: false
    });
  },

  // Validate master admin credentials against static database
  async validateMasterCredentials(identifier, password) {
    try {
      // First attempt login to validate credentials
      const loginResult = await this.login(identifier, password);
      
      if (loginResult.access_token) {
        // Get user profile to verify role
        const userProfile = await adminApi.getMe();
        
        // Check if user has master admin privileges
        const isMasterAdmin = ['super_admin', 'master_admin'].includes(userProfile.role);
        
        if (!isMasterAdmin) {
          this.logout(); // Clear token for non-master admin
          throw new Error('Access denied: Master admin privileges required');
        }
        
        return {
          isValid: true,
          user: userProfile,
          token: loginResult.access_token
        };
      }
      
      return { isValid: false, error: 'Invalid credentials' };
    } catch (error) {
      this.logout(); // Ensure clean state on failure
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

// Admin Management API
export const adminApi = {
  // Get all admins (super admin only)
  async getAll(params = {}) {
    return apiClient.get('/admins/', params);
  },

  // Get current admin info
  async getMe() {
    return apiClient.get('/admins/me');
  },

  // Create new admin (super admin only)
  async create(data) {
    return apiClient.post('/admins/', data);
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

// Rent Apartments API
export const rentApartmentsApi = {
  // Get all rent apartments
  async getAll(params = {}) {
    return apiClient.get('/apartments/rent', params);
  },

  // Get specific rent apartment
  async getById(apartmentId) {
    return apiClient.get(`/apartments/rent/${apartmentId}`);
  },

  // Create new rent apartment
  async create(data) {
    return apiClient.post('/apartments/rent', data);
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

// Sale Apartments API
export const saleApartmentsApi = {
  // Get all sale apartments
  async getAll(params = {}) {
    return apiClient.get('/apartments/sale', params);
  },

  // Get specific sale apartment
  async getById(apartmentId) {
    return apiClient.get(`/apartments/sale/${apartmentId}`);
  },

  // Create new sale apartment
  async create(data) {
    return apiClient.post('/apartments/sale', data);
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

// Apartment Parts (Studios) API
export const apartmentPartsApi = {
  // Get all apartment parts
  async getAll(params = {}) {
    return apiClient.get('/apartments/parts', params);
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

// Admin's Own Content API
export const myContentApi = {
  // Get admin's own apartments and studios
  async getMyContent(params = {}) {
    return apiClient.get('/apartments/my-content', params);
  }
};

// Rental Contracts API
export const rentalContractsApi = {
  // Get all rental contracts
  async getAll(params = {}) {
    return apiClient.get('/rental-contracts/', params);
  },

  // Get rental contracts by studio (ordered by studio number)
  async getByStudio(params = {}) {
    return apiClient.get('/rental-contracts/by-studio', params);
  },

  // Get specific rental contract
  async getById(contractId) {
    return apiClient.get(`/rental-contracts/${contractId}`);
  },

  // Create new rental contract
  async create(data) {
    return apiClient.post('/rental-contracts/', data);
  },

  // Update rental contract
  async update(contractId, data) {
    return apiClient.put(`/rental-contracts/${contractId}`, data);
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
    return apiClient.get('/rental-contracts/due-for-renewal', params);
  },

  // Get contracts with overdue payments
  async getOverduePayments(params = {}) {
    return apiClient.get('/rental-contracts/overdue-payments', params);
  },

  // Get contract statistics
  async getStatistics(params = {}) {
    return apiClient.get('/rental-contracts/statistics', params);
  },

  // Generate contract document
  async generateDocument(contractId, documentType = 'pdf') {
    return apiClient.get(`/rental-contracts/${contractId}/document`, { 
      document_type: documentType 
    });
  },

  // Bulk operations
  async bulkUpdate(contractIds, updateData) {
    return apiClient.post('/rental-contracts/bulk-update', {
      contract_ids: contractIds,
      update_data: updateData
    });
  }
};

// Utility functions for data transformation
export const dataTransformers = {
  // Transform frontend apartment data to backend format
  transformApartmentToApi(frontendData, type = 'rent') {
    return {
      name: frontendData.name || frontendData.title,
      location: frontendData.location?.toLowerCase(),
      address: frontendData.address,
      area: String(frontendData.area).replace(' sqm', ''),
      number: frontendData.number || frontendData.unitNumber,
      price: String(frontendData.price).replace(/[^0-9.]/g, ''),
      bedrooms: Number(frontendData.bedrooms),
      bathrooms: frontendData.bathrooms?.toLowerCase() || 'private',
      description: frontendData.description,
      photos_url: frontendData.photos_url || frontendData.images || [],
      location_on_map: frontendData.location_on_map || frontendData.mapLocation,
      facilities_amenities: Array.isArray(frontendData.amenities) 
        ? frontendData.amenities.join(', ') 
        : frontendData.facilities_amenities || frontendData.amenities,
      floor: Number(frontendData.floor),
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
      location: backendData.location,
      address: backendData.address,
      area: backendData.area,
      unitNumber: backendData.number,
      number: backendData.number,
      price: backendData.price,
      bedrooms: backendData.bedrooms,
      bathrooms: backendData.bathrooms,
      description: backendData.description,
      images: backendData.photos_url,
      photos_url: backendData.photos_url,
      mapLocation: backendData.location_on_map,
      location_on_map: backendData.location_on_map,
      amenities: backendData.facilities_amenities?.split(', ') || [],
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
      type: 'Apartment',
      ownership: 'Rent',
      completionStatus: 'Ready',
      studios: backendData.apartment_parts || []
    };
  },

  // Transform studio part data
  transformStudioToApi(frontendData) {
    return {
      studio_number: frontendData.studio_number || frontendData.unitNumber,
      rent_value: String(frontendData.rent_value || frontendData.price).replace(/[^0-9.]/g, ''),
      floor: Number(frontendData.floor)
    };
  },

  transformStudioFromApi(backendData) {
    return {
      id: backendData.id,
      apartment_id: backendData.apartment_id,
      studio_number: backendData.studio_number,
      unitNumber: backendData.studio_number,
      rent_value: backendData.rent_value,
      price: backendData.rent_value,
      status: backendData.status,
      isAvailable: backendData.status === 'available',
      floor: backendData.floor,
      created_by_admin_id: backendData.created_by_admin_id,
      createdBy: backendData.created_by_admin_id,
      created_at: backendData.created_at,
      updated_at: backendData.updated_at
    };
  },

  // Transform rental contract data
  transformContractToApi(frontendData) {
    return {
      apartment_part_id: frontendData.apartment_part_id || frontendData.studioId,
      customer_name: frontendData.customer_name || frontendData.customerName,
      customer_phone: frontendData.customer_phone || frontendData.customerPhone,
      customer_id_number: frontendData.customer_id_number || frontendData.customerIdNumber,
      how_did_customer_find_us: frontendData.how_did_customer_find_us || frontendData.customerSource,
      paid_deposit: String(frontendData.paid_deposit || frontendData.deposit),
      warrant_amount: String(frontendData.warrant_amount || frontendData.warrantyAmount),
      rent_start_date: frontendData.rent_start_date || frontendData.startDate,
      rent_end_date: frontendData.rent_end_date || frontendData.endDate,
      rent_period: Number(frontendData.rent_period || frontendData.contractPeriod),
      contract_url: frontendData.contract_url || frontendData.contractDocument,
      studio_number: frontendData.studio_number || frontendData.studioNumber,
      customer_id_url: frontendData.customer_id_url || frontendData.customerIdDocument,
      commission: String(frontendData.commission),
      rent_price: String(frontendData.rent_price || frontendData.monthlyRent)
    };
  }
};

// Enhanced error handler for UI with better user feedback
export const handleApiError = (error, defaultMessage = 'An error occurred') => {
  if (API_CONFIG.ENABLE_LOGGING) {
    console.error('API request failed');
  }
  
  if (error instanceof ApiError) {
    if (error.status === 422) {
      const validationErrors = error.getValidationErrors();
      if (validationErrors.length > 0) {
        return validationErrors.map(err => `${err.field}: ${err.message}`).join(', ');
      }
    }
    
    // Handle different HTTP status codes with user-friendly messages
    switch (error.status) {
      case 0:
        return 'Unable to connect to server. Please check if the backend is running and try again.';
      case 400:
        return 'Invalid request. Please check your input and try again.';
      case 401:
        return 'Authentication failed. Please log in again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return 'Conflict: This action cannot be completed due to a conflict with existing data.';
      case 422:
        return 'Validation failed. Please check your input.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
        return 'Server error. Please try again later or contact support.';
      case 502:
      case 503:
      case 504:
        return 'Service temporarily unavailable. Please try again later.';
      default:
        return error.getDetails() || defaultMessage;
    }
  }
  
  // Handle network errors - more specific messages
  if (error.name === 'NetworkError' || error.message === 'Failed to fetch') {
    return 'Cannot connect to backend server. Please ensure your backend is running on the configured URL.';
  }
  
  // Handle timeout errors
  if (error.name === 'TimeoutError') {
    return 'Request timed out. Please check your backend server and try again.';
  }
  
  // Handle other common errors
  if (error.message?.includes('CORS')) {
    return 'CORS error. Please check your backend CORS configuration.';
  }
  
  return error.message || defaultMessage;
};

// Enhanced error notifications for different types of operations
export const getOperationErrorMessage = (operation, error) => {
  const baseMessage = handleApiError(error);
  
  const operationMessages = {
    login: 'Login failed',
    signup: 'Account creation failed',
    create: 'Failed to create item',
    update: 'Failed to update item',
    delete: 'Failed to delete item',
    fetch: 'Failed to load data',
    upload: 'Failed to upload file',
    search: 'Search failed'
  };
  
  const prefix = operationMessages[operation] || 'Operation failed';
  
  // If it's a validation error, show just the validation message
  if (baseMessage.includes(':')) {
    return baseMessage;
  }
  
  return `${prefix}: ${baseMessage}`;
};

// Helper function for retry logic
export const createRetryFunction = (apiCall, maxRetries = API_CONFIG.MAX_RETRIES || 3, delay = 1000) => {
  return async (...args) => {
    // Skip retry logic if disabled
    if (!API_CONFIG.ENABLE_RETRY) {
      return apiCall(...args);
    }
    
    let lastError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (API_CONFIG.ENABLE_LOGGING && attempt > 0) {
          console.log('API retry attempt initiated');
        }
        return await apiCall(...args);
      } catch (error) {
        lastError = error;
        
        // Don't retry on client errors (4xx) except for 429 (rate limiting)
        if (error instanceof ApiError && error.status >= 400 && error.status < 500 && error.status !== 429) {
          throw error;
        }
        
        // Don't retry on the last attempt
        if (attempt === maxRetries) {
          break;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay * (attempt + 1)));
      }
    }
    
    throw lastError;
  };
};

// Export the main API client for direct use if needed
export default apiClient;
