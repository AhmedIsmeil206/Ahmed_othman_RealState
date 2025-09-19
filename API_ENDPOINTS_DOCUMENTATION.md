# Ahmed Othman Real Estate Management System
## API Endpoints Documentation

**Project**: Ahmed_othman_RealState  
**Owner**: AhmedIsmeil206  
**Base URL**: `http://localhost:8000/api/v1`  
**Authentication**: JWT Bearer Token  
**Generated**: September 19, 2025

---

## Table of Contents

1. [Authentication Endpoints](#authentication-endpoints)
2. [Admin Management Endpoints](#admin-management-endpoints)
3. [Rent Apartments Endpoints](#rent-apartments-endpoints)
4. [Sale Apartments Endpoints](#sale-apartments-endpoints)
5. [Apartment Parts (Studios) Endpoints](#apartment-parts-studios-endpoints)
6. [My Content Endpoints](#my-content-endpoints)
7. [Rental Contracts Endpoints](#rental-contracts-endpoints)
8. [API Configuration](#api-configuration)
9. [File Usage Summary](#file-usage-summary)

---

## Authentication Endpoints

### POST /auth/login
**Purpose**: Login with username/password (form data)  
**File**: `src/services/api.js` (Line 230)

**Usage Locations**:
- `src/store/slices/masterAuthSlice.js` (Lines 193, 207) - Master admin signup & login
- `src/hooks/useAdminAuth.jsx` (Line 50) - Admin login functionality

**Implementation**:
```javascript
async login(username, password) {
  const formData = new URLSearchParams();
  formData.append('username', username);
  formData.append('password', password);
  // Returns access_token and user data
}
```

### POST /auth/create-master-admin
**Purpose**: Create master admin (one-time setup)  
**File**: `src/services/api.js` (Line 244)

**Usage Locations**:
- `src/store/slices/masterAuthSlice.js` (Line 190) - Master admin signup process

**Implementation**:
```javascript
async createMasterAdmin(data) {
  return apiClient.post('/auth/create-master-admin', data, {
    includeAuth: false
  });
}
```

### GET /auth/check-master-admin
**Purpose**: Check if master admin exists  
**File**: `src/services/api.js` (Line 251)

**Usage Locations**:
- `src/store/slices/masterAuthSlice.js` (Line 161) - App initialization check

---

## Admin Management Endpoints

### GET /admins/
**Purpose**: Get all admins (super admin only)  
**File**: `src/services/api.js` (Line 271)

**Usage Locations**:
- `src/hooks/useAdminManagement.jsx` (Line 54) - Fetch all admin accounts
- `src/hooks/useDashboardData.jsx` (Line 128) - Dashboard admin statistics

### GET /admins/me
**Purpose**: Get current admin info  
**File**: `src/services/api.js` (Line 276)

**Usage Locations**:
- `src/store/slices/masterAuthSlice.js` (Lines 143, 210) - Get current user profile
- `src/hooks/useAdminAuth.jsx` (Lines 53, 77) - Verify admin authentication

### POST /admins/
**Purpose**: Create new admin (super admin only)  
**File**: `src/services/api.js` (Line 281)

**Usage Locations**:
- `src/hooks/useAdminAuth.jsx` (Line 113) - Create admin account
- `src/hooks/useAdminManagement.jsx` (Line 72) - Admin management interface

### PUT /admins/{adminId}
**Purpose**: Update admin (super admin only)  
**File**: `src/services/api.js` (Line 286)

**Usage Locations**:
- `src/store/slices/masterAuthSlice.js` (Line 237) - Update master profile
- `src/hooks/useAdminAuth.jsx` (Line 139) - Toggle admin status
- `src/hooks/useAdminManagement.jsx` (Lines 95, 122) - Update admin details & status

### DELETE /admins/{adminId}
**Purpose**: Delete admin (super admin only)  
**File**: `src/services/api.js` (Line 291)

**Usage Locations**:
- `src/hooks/useAdminAuth.jsx` (Line 149) - Delete admin account
- `src/hooks/useAdminManagement.jsx` (Line 144) - Admin management interface

---

## Rent Apartments Endpoints

### GET /apartments/rent
**Purpose**: Get all rent apartments  
**File**: `src/services/api.js` (Line 299)

**Usage Locations**:
- `src/hooks/usePropertyManagement.jsx` (Line 185) - Fetch rental properties
- `src/hooks/useDashboardData.jsx` (Line 116) - Dashboard statistics

### GET /apartments/rent/{apartmentId}
**Purpose**: Get specific rent apartment  
**File**: `src/services/api.js` (Line 304)

**Usage**: Individual apartment details retrieval

### POST /apartments/rent
**Purpose**: Create new rent apartment  
**File**: `src/services/api.js` (Line 309)

**Usage Locations**:
- `src/hooks/usePropertyManagement.jsx` (Line 203) - Add new rental property

### PUT /apartments/rent/{apartmentId}
**Purpose**: Update rent apartment  
**File**: `src/services/api.js` (Line 314)

**Usage Locations**:
- `src/hooks/usePropertyManagement.jsx` (Line 226) - Update rental property

### DELETE /apartments/rent/{apartmentId}
**Purpose**: Delete rent apartment  
**File**: `src/services/api.js` (Line 319)

**Usage Locations**:
- `src/hooks/usePropertyManagement.jsx` (Line 248) - Delete rental property

---

## Sale Apartments Endpoints

### GET /apartments/sale
**Purpose**: Get all sale apartments  
**File**: `src/services/api.js` (Line 327)

**Usage Locations**:
- `src/hooks/usePropertyManagement.jsx` (Line 381) - Fetch sale properties
- `src/hooks/useDashboardData.jsx` (Line 119) - Dashboard statistics

### GET /apartments/sale/{apartmentId}
**Purpose**: Get specific sale apartment  
**File**: `src/services/api.js` (Line 332)

**Usage**: Individual sale apartment details

### POST /apartments/sale
**Purpose**: Create new sale apartment  
**File**: `src/services/api.js` (Line 337)

**Usage Locations**:
- `src/hooks/usePropertyManagement.jsx` (Line 399) - Add new sale property

### PUT /apartments/sale/{apartmentId}
**Purpose**: Update sale apartment  
**File**: `src/services/api.js` (Line 342)

**Usage Locations**:
- `src/hooks/usePropertyManagement.jsx` (Line 422) - Update sale property

### DELETE /apartments/sale/{apartmentId}
**Purpose**: Delete sale apartment  
**File**: `src/services/api.js` (Line 347)

**Usage Locations**:
- `src/hooks/usePropertyManagement.jsx` (Line 444) - Delete sale property

---

## Apartment Parts (Studios) Endpoints

### GET /apartments/parts
**Purpose**: Get all apartment parts  
**File**: `src/services/api.js` (Line 355)

**Usage Locations**:
- `src/hooks/usePropertyManagement.jsx` (Line 269) - Fetch studios by apartment
- `src/hooks/useDashboardData.jsx` (Line 122) - Dashboard statistics

### GET /apartments/parts/{partId}
**Purpose**: Get specific apartment part  
**File**: `src/services/api.js` (Line 360)

**Usage**: Individual studio details

### POST /apartments/rent/{apartmentId}/parts
**Purpose**: Create new apartment part for rent apartment  
**File**: `src/services/api.js` (Line 365)

**Usage Locations**:
- `src/hooks/usePropertyManagement.jsx` (Line 293) - Add new studio

### PUT /apartments/parts/{partId}
**Purpose**: Update apartment part  
**File**: `src/services/api.js` (Line 370)

**Usage Locations**:
- `src/hooks/usePropertyManagement.jsx` (Lines 316, 357) - Update studio details & availability

### DELETE /apartments/parts/{partId}
**Purpose**: Delete apartment part  
**File**: `src/services/api.js` (Line 375)

**Usage Locations**:
- `src/hooks/usePropertyManagement.jsx` (Line 338) - Delete studio

---

## My Content Endpoints

### GET /apartments/my-content
**Purpose**: Get admin's own apartments and studios  
**File**: `src/services/api.js` (Line 383)

**Usage Locations**:
- `src/hooks/usePropertyManagement.jsx` (Line 465) - Fetch admin's properties
- `src/hooks/useDashboardData.jsx` (Lines 81, 225, 253) - Dashboard data & statistics

---

## Rental Contracts Endpoints

### GET /rental-contracts/
**Purpose**: Get all rental contracts  
**File**: `src/services/api.js` (Line 391)

**Usage Locations**:
- `src/hooks/useRentalContracts.jsx` (Line 110) - Fetch contracts list
- `src/hooks/useDashboardData.jsx` (Lines 87, 125) - Dashboard statistics

### GET /rental-contracts/by-studio
**Purpose**: Get rental contracts by studio (ordered by studio number)  
**File**: `src/services/api.js` (Line 396)

**Usage Locations**:
- `src/hooks/useRentalContracts.jsx` (Line 128) - Studio-specific contracts

### GET /rental-contracts/{contractId}
**Purpose**: Get specific rental contract  
**File**: `src/services/api.js` (Line 401)

**Usage Locations**:
- `src/hooks/useRentalContracts.jsx` (Line 146) - Contract details

### POST /rental-contracts/
**Purpose**: Create new rental contract  
**File**: `src/services/api.js` (Line 406)

**Usage Locations**:
- `src/hooks/useRentalContracts.jsx` (Line 164) - Add new rental contract

### PUT /rental-contracts/{contractId}
**Purpose**: Update rental contract  
**File**: `src/services/api.js` (Line 411)

**Usage Locations**:
- `src/hooks/useRentalContracts.jsx` (Lines 188, 237, 268) - Update contract details & status

### DELETE /rental-contracts/{contractId}
**Purpose**: Delete rental contract (super admin only)  
**File**: `src/services/api.js` (Line 416)

**Usage Locations**:
- `src/hooks/useRentalContracts.jsx` (Line 216) - Delete rental contract

### POST /rental-contracts/{contractId}/renew
**Purpose**: Renew rental contract  
**File**: `src/services/api.js` (Line 421)

**Usage Locations**:
- `src/hooks/useRentalContracts.jsx` (Line 300) - Contract renewal

### POST /rental-contracts/{contractId}/payments
**Purpose**: Record payment for contract  
**File**: `src/services/api.js` (Line 426)

**Usage Locations**:
- `src/hooks/useRentalContracts.jsx` (Line 332) - Payment recording

### GET /rental-contracts/{contractId}/payments
**Purpose**: Get payment history for contract  
**File**: `src/services/api.js` (Line 431)

**Usage Locations**:
- `src/hooks/useRentalContracts.jsx` (Line 368) - Payment history

### GET /rental-contracts/due-for-renewal
**Purpose**: Get contracts due for renewal  
**File**: `src/services/api.js` (Line 436)

**Usage Locations**:
- `src/hooks/useRentalContracts.jsx` (Line 387) - Renewal alerts

### GET /rental-contracts/overdue-payments
**Purpose**: Get contracts with overdue payments  
**File**: `src/services/api.js` (Line 441)

**Usage Locations**:
- `src/hooks/useRentalContracts.jsx` (Line 407) - Payment alerts

### GET /rental-contracts/statistics
**Purpose**: Get contract statistics  
**File**: `src/services/api.js` (Line 446)

**Usage**: Statistics dashboard

### GET /rental-contracts/{contractId}/document
**Purpose**: Generate contract document  
**File**: `src/services/api.js` (Line 451)

**Usage**: Document generation

### POST /rental-contracts/bulk-update
**Purpose**: Bulk operations on contracts  
**File**: `src/services/api.js` (Line 458)

**Usage**: Bulk contract operations

---

## API Configuration

### Base Configuration
```javascript
const API_CONFIG = {
  BASE_URL: 'http://localhost:8000/api/v1',
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json'
  }
};
```

### Authentication
- **Method**: JWT Bearer Token
- **Storage**: localStorage (`api_access_token`)
- **Header**: `Authorization: Bearer {token}`

### Error Handling
- Custom `ApiError` class for structured error responses
- Automatic token refresh on 401 errors
- Retry logic for network failures
- User-friendly error messages for different HTTP status codes

### Data Transformers
- `transformApartmentToApi()` - Frontend to backend data format
- `transformApartmentFromApi()` - Backend to frontend data format
- `transformStudioToApi()` - Studio data transformation
- `transformContractToApi()` - Contract data transformation

---

## File Usage Summary

### Primary API Integration Files

#### Core API Service
- **`src/services/api.js`** (694 lines)
  - Central API configuration and endpoint definitions
  - Authentication management
  - Error handling utilities
  - Data transformation functions

#### Authentication & User Management
- **`src/store/slices/masterAuthSlice.js`**
  - Redux slice for master admin authentication
  - Uses: `authApi.login`, `authApi.createMasterAdmin`, `adminApi.getMe`

- **`src/hooks/useAdminAuth.jsx`**
  - Admin authentication and management hook
  - Uses: `authApi.login`, `adminApi.getMe`, `adminApi.create`, `adminApi.update`, `adminApi.delete`

- **`src/hooks/useAdminManagement.jsx`**
  - Admin CRUD operations hook
  - Uses: `adminApi.getAll`, `adminApi.create`, `adminApi.update`, `adminApi.delete`

#### Property Management
- **`src/hooks/usePropertyManagement.jsx`**
  - Property and studio CRUD operations
  - Uses: `rentApartmentsApi.*`, `saleApartmentsApi.*`, `apartmentPartsApi.*`, `myContentApi.*`

#### Contract Management
- **`src/hooks/useRentalContracts.jsx`**
  - Complete rental contract lifecycle management
  - Uses: All `rentalContractsApi.*` endpoints

#### Dashboard & Analytics
- **`src/hooks/useDashboardData.jsx`**
  - Centralized dashboard data aggregation
  - Uses: `myContentApi.getMyContent`, `rentalContractsApi.getAll`, `adminApi.getAll`

### API Usage Statistics

- **Total Endpoints**: 37 unique API endpoints
- **Total Files Using API**: 6 primary integration files
- **Authentication Endpoints**: 3 endpoints
- **Admin Management**: 5 endpoints
- **Property Management**: 15 endpoints (rent + sale + studios)
- **Contract Management**: 13 endpoints
- **Dashboard Data**: 1 endpoint

### Security Features

1. **JWT Authentication**: Secure token-based authentication
2. **Role-based Access**: Super Admin, Studio Rental, Apartment Sale roles
3. **Automatic Logout**: On 401 errors and token expiration
4. **Request Validation**: Client-side validation before API calls
5. **Error Sanitization**: Safe error message display to users

---

**Document Generated**: September 19, 2025  
**Project Repository**: https://github.com/AhmedIsmeil206/Ahmed_othman_RealState  
**Total API Integration Points**: 50+ usage locations across 6 core files