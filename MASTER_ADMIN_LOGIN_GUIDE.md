# Master Admin Authentication Guide

## 🔐 How to Login as Master Admin

This guide explains the complete master admin authentication system implemented with comprehensive credential validation against your static database backend.

## 📋 Prerequisites

### Backend Requirements

1. **Database Setup**: Ensure your static database contains a master admin user with:
   ```json
   {
     "id": 1,
     "email": "master@example.com",
     "phone": "+201111111111", 
     "full_name": "Master Administrator",
     "role": "super_admin",
     "password": "[hashed_password]",
     "is_active": true
   }
   ```

2. **API Endpoints**: Ensure these endpoints are working:
   - `POST /auth/login` - Authentication against static database
   - `GET /admins/me` - Fetch authenticated user profile
   - `GET /auth/check-master-admin` - Check if master admin exists

## 🚀 Login Process

### Step 1: Access Master Admin Login
Navigate to the master admin login page in your application (typically `/master-admin/login`).

### Step 2: Enter Credentials
You can login using either:

**Option A - Email Login:**
- Email: `master@example.com`
- Password: `masterpassword123` (or your configured password)

**Option B - Phone Login:**
- Phone: `+201111111111` (Egyptian format)
- Password: `masterpassword123` (or your configured password)

### Step 3: Authentication Flow
The system will:
1. ✅ Validate input format (email/phone + password)
2. 🔍 Check credentials against static database via `POST /auth/login`
3. 👤 Fetch user profile via `GET /admins/me` 
4. 🛡️ Verify master admin role (`super_admin` or `master_admin`)
5. 🔍 Cross-validate login identifier with profile data
6. ✅ Create authenticated session and redirect to dashboard

## 🔧 Authentication Logic Details

### Credential Validation
The system performs comprehensive validation:

```javascript
// Input validation
- Email format: contains @ and valid structure
- Phone format: Egyptian mobile (+20 or 0 + 10 digits)  
- Password: minimum 6 characters

// Backend validation
- POST /auth/login with form data (username/email + password)
- Receives JWT access token on success
- Handles 401 (invalid), 404 (not found), 422 (format) errors

// Profile verification  
- GET /admins/me to fetch user profile
- Verify role is 'super_admin' or 'master_admin'
- Check profile completeness (email, phone, name)

// Cross-validation
- Email login: verify input email matches profile email
- Phone login: verify input phone matches profile phone
- Ensure no credential mismatch between login and profile
```

### Error Handling
The system provides specific error messages:

- **Invalid Credentials**: "Invalid email/phone or password. Please check your credentials."
- **Access Denied**: "Access denied: Master admin privileges required."
- **Account Not Found**: "Account not found. Please verify your credentials."
- **Format Error**: "Please enter a valid email address or Egyptian mobile number."
- **Profile Mismatch**: "Authentication mismatch: Login identifier does not match profile."

## 🧪 Testing Your Setup

### 1. Check Backend Database
Verify your master admin user exists:
```sql
SELECT * FROM admins WHERE role IN ('super_admin', 'master_admin');
```

### 2. Test API Endpoints
Use tools like Postman to test:

**Test Login:**
```bash
POST http://localhost:8000/api/v1/auth/login
Content-Type: application/x-www-form-urlencoded

username=master@example.com&password=masterpassword123
```

**Test Profile Fetch:**
```bash
GET http://localhost:8000/api/v1/admins/me  
Authorization: Bearer [access_token_from_login]
```

### 3. Monitor Console Logs
During login, monitor browser console for:
- 🔐 Master Admin Authentication Started
- ✅ Backend authentication successful  
- ✅ Master admin role validated
- ✅ Master Admin Authentication Successful

## 🔍 Debugging Common Issues

### Issue: "Invalid Credentials"
**Solutions:**
- Verify master admin exists in database
- Check password is correctly hashed in database
- Ensure email/phone matches exactly
- Verify backend `/auth/login` endpoint works

### Issue: "Access Denied" 
**Solutions:**
- Check user role is 'super_admin' or 'master_admin'  
- Verify database user has correct role assigned
- Ensure user account is active (`is_active: true`)

### Issue: "Profile Mismatch"
**Solutions:**
- Ensure login email matches database email exactly
- Verify phone number format matches database format
- Check for extra spaces or different formatting

### Issue: "Network Error"
**Solutions:**
- Verify backend server is running on correct port
- Check CORS configuration allows frontend requests
- Ensure API base URL is correctly configured

## 📱 Frontend Configuration

### Environment Variables
Ensure these are set in your `.env` file:
```bash
REACT_APP_API_BASE_URL=http://localhost:8000/api/v1
REACT_APP_ENVIRONMENT=development
REACT_APP_TOKEN_STORAGE_KEY=api_access_token
```

### Redux Store Setup
The authentication state is managed in Redux:
```javascript
// Current user state after successful login
{
  currentUser: {
    id: 1,
    email: "master@example.com",
    full_name: "Master Administrator", 
    phone: "+201111111111",
    role: "super_admin",
    loginTime: "2025-09-27T...",
    authMethod: "email",
    sessionId: "mas_1234567890_abc123"
  },
  isLoading: false,
  error: null,
  initialized: true
}
```

## 🔒 Security Features

- **Comprehensive Validation**: Multi-step authentication process
- **Role-Based Access**: Only super_admin/master_admin roles allowed
- **Token Management**: JWT tokens with automatic cleanup on failure  
- **Profile Cross-Validation**: Login credentials must match user profile
- **Session Security**: Unique session IDs and timestamps
- **Error Sanitization**: Sensitive errors not exposed to users

## 📞 Support

If you're still unable to login as master admin:

1. **Check all prerequisites** listed above
2. **Review console logs** for specific error details  
3. **Test API endpoints** manually to isolate issues
4. **Verify database configuration** and user setup
5. **Check network connectivity** between frontend and backend

The system is designed to provide clear error messages to help diagnose authentication issues quickly.