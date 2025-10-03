# AO Real Estate API - Frontend Integration Guide

## 🚀 Quick Start

**Base URL:** `http://localhost:8000/api/v1`  
**Authentication:** JWT Bearer Token  
**Content-Type:** `application/json`

## 🔐 Authentication Flow

### 1. Login
**Endpoint:** `POST /auth/login`

**Request Body (Form Data):**
```
username=admin@example.com&password=password123
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### 2. Using Token in Requests
**Headers Required:**
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

## 🚨 **CRITICAL FIELD MAPPING**

**Frontend vs API Field Names:**
| Frontend Field | API Field | Notes |
|---|---|---|
| `title` | `name` | ⚠️ **Required** - Apartment/property name |
| `images` | `photos_url` | Array of image URLs |
| `amenities` | `facilities_amenities` | Text description of amenities |
| `coordinates` | `location_on_map` | Google Maps link or coordinates |
| `contact_number` | Auto-filled | ❌ **Don't send** - Filled by admin's phone |
| `total_studios` | `total_parts` | Number of parts in apartment |

**Enum Values (Case Sensitive):**
- `location`: `"maadi"` | `"mokkattam"` (lowercase)
- `bathrooms`: `"shared"` | `"private"` (string, not integer)
- `furnished`: `"yes"` | `"no"`
- `balcony`: `"yes"` | `"shared"` | `"no"`
- `status` (parts): `"available"` | `"rented"` | `"upcoming_end"`
- `role` (admin): `"super_admin"` | `"studio_rental"` | `"apartment_sale"`
- `how_did_customer_find_us`: `"facebook"` | `"instagram"` | `"google"` | `"referral"` | `"walk_in"` | `"other"`

**Required Fields for Apartment Creation:**
- ✅ `name` (not `title`)
- ✅ `location` (lowercase enum)
- ✅ `address`
- ✅ `area` (decimal as string)
- ✅ `number` (apartment number)
- ✅ `price` (decimal as string)
- ✅ `bedrooms` (integer)
- ✅ `bathrooms` (string enum)
- ✅ `floor` (integer - for rent apartments)
- ✅ `total_parts` (integer - for rent apartments)

## ⚠️ **COMMON VALIDATION ERRORS**

**Error Response Format:**
```json
{
  "detail": [
    {
      "type": "missing",
      "loc": ["body", "name"],
      "msg": "Field required",
      "input": { /* your request body */ }
    }
  ]
}
```

**Frequent Issues:**
1. **Missing `name` field** - Frontend sends `title`, API expects `name`
2. **Wrong `location` case** - Use `"mokkattam"` not `"Mokkattam"`
3. **Wrong `bathrooms` type** - Use `"private"` not `1`
4. **Missing required fields** - `floor` and `total_parts` for rent apartments
5. **Auto-filled fields** - Don't send `contact_number`, it's auto-filled

**❌ WRONG Request (causes validation errors):**
```json
{
  "title": "Marwan",                    // ❌ Should be "name"
  "location": "Mokkattam",              // ❌ Should be "mokkattam" (lowercase)
  "address": "aa",
  "price": 0,
  "area": 0,
  "bedrooms": 0,
  "bathrooms": 1,                       // ❌ Should be "private" or "shared"
  "furnished": true,                    // ❌ Should be "yes" or "no"
  "amenities": ["Gym"],                 // ❌ Should be "facilities_amenities"
  "images": ["base64..."],              // ❌ Should be "photos_url"
  "coordinates": {"lat": 0, "lng": 0},  // ❌ Should be "location_on_map"
  "contact_number": "+20123456789"      // ❌ Don't send, auto-filled
}
```

**✅ CORRECT Request:**
```json
{
  "name": "Marwan",
  "location": "mokkattam",
  "address": "aa",
  "number": "A-001",
  "price": "0.00",
  "area": "0.00",
  "bedrooms": 0,
  "bathrooms": "private",
  "floor": 1,
  "total_parts": 1,
  "description": "aaa",
  "photos_url": ["https://example.com/image.jpg"],
  "location_on_map": "https://maps.google.com/...",
  "facilities_amenities": "Gym"
}
```

## 📋 Complete API Reference

### Authentication Endpoints

#### POST `/api/v1/auth/login`
**Purpose:** Authenticate admin and get access token

**Request Body (Form Data):**
```
username=admin@example.com&password=password123
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Error Cases:**
- `401`: Invalid credentials
- `422`: Validation error (missing fields)

#### POST `/api/v1/auth/register`
**Purpose:** Register new admin (super admin only)

**Request:**
```json
{
  "full_name": "New Admin",
  "email": "newadmin@example.com",
  "phone": "+201234567890",
  "password": "password123",
  "role": "apartment_sale"
}
```

**Response:**
```json
{
  "id": 2,
  "full_name": "New Admin",
  "email": "newadmin@example.com",
  "phone": "+201234567890",
  "role": "apartment_sale",
  "created_at": "2025-09-05T20:15:30",
  "updated_at": null
}
```

#### POST `/api/v1/auth/create-master-admin`
**Purpose:** Create initial master admin (one-time setup)

**Request:**
```json
{
  "full_name": "Master Administrator",
  "email": "master@example.com",
  "phone": "+201111111111",
  "password": "masterpassword123",
  "master_password": "MASTER_ADMIN_SETUP_2024"
}
```

**Response:**
```json
{
  "id": 1,
  "full_name": "Master Administrator",
  "email": "master@example.com",
  "phone": "+201111111111",
  "role": "super_admin",
  "created_at": "2025-09-05T19:51:52",
  "updated_at": null
}
```

### Admin Management Endpoints

#### GET `/api/v1/admins/`
**Purpose:** Get list of all admins (super admin only)

**Query Parameters:**
- `skip` (number, optional): Records to skip (default: 0)
- `limit` (number, optional): Max records (default: 100)

**Response:**
```json
[
  {
    "id": 1,
    "full_name": "Master Administrator",
    "email": "master@example.com",
    "phone": "+201111111111",
    "role": "super_admin",
    "created_at": "2025-09-05T19:51:52",
    "updated_at": null
  }
]
```

**Error Cases:**
- `401`: Not authenticated
- `403`: Not super admin

#### GET `/api/v1/admins/me`
**Purpose:** Get current admin's information

**Headers Required:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": 1,
  "full_name": "Master Administrator",
  "email": "master@example.com",
  "phone": "+201111111111",
  "role": "super_admin",
  "created_at": "2025-09-05T19:51:52",
  "updated_at": null
}
```

#### POST `/api/v1/admins/`
**Purpose:** Create new admin (super admin only)

**Request:**
```json
{
  "full_name": "New Admin",
  "email": "newadmin@example.com",
  "phone": "+201234567890",
  "password": "password123",
  "role": "apartment_sale"
}
```

**Valid Roles:**
- `super_admin`: Full system access
- `studio_rental`: Can manage studio rentals
- `apartment_sale`: Can manage apartment sales

#### PUT `/api/v1/admins/{admin_id}`
**Purpose:** Update admin information (super admin only)

**Request:**
```json
{
  "full_name": "Updated Admin Name",
  "email": "updated@example.com",
  "phone": "+201234567890",
  "role": "studio_rental"
}
```

**Response:**
```json
{
  "id": 3,
  "full_name": "Updated Admin Name",
  "email": "updated@example.com",
  "phone": "+201234567890",
  "role": "studio_rental",
  "created_at": "2025-09-05T20:15:30",
  "updated_at": "2025-09-05T20:20:15"
}
```

#### GET `/api/v1/admins/{admin_id}`
**Purpose:** Get admin by ID (super admin only)

**Response:**
```json
{
  "id": 2,
  "full_name": "Regular Admin",
  "email": "admin@example.com",
  "phone": "+201234567890",
  "role": "studio_rental",
  "created_at": "2025-09-05T20:15:30",
  "updated_at": null
}
```

#### PUT `/api/v1/admins/me`
**Purpose:** Update current admin's own information

**Request:**
```json
{
  "full_name": "Updated Admin Name",
  "email": "updated@example.com",
  "phone": "+201234567890"
}
```

**Response:**
```json
{
  "id": 2,
  "full_name": "Updated Admin Name",
  "email": "updated@example.com",
  "phone": "+201234567890",
  "role": "studio_rental",
  "created_at": "2025-09-05T20:15:30",
  "updated_at": "2025-09-05T20:20:15"
}
```

#### DELETE `/api/v1/admins/{admin_id}`
**Purpose:** Delete admin (super admin only)

**Response:**
```json
{
  "id": 2,
  "full_name": "Regular Admin",
  "email": "admin@example.com",
  "phone": "+201234567890",
  "role": "studio_rental",
  "created_at": "2025-09-05T20:15:30",
  "updated_at": null
}
```

### Apartment Management Endpoints

#### GET `/api/v1/apartments/rent`
**Purpose:** Get list of all rent apartments

**Query Parameters:**
- `skip` (number, optional): Records to skip (default: 0)
- `limit` (number, optional): Max records (default: 100)

**Response:**
```json
[
  {
    "id": 1,
    "name": "Modern Studio Apartment in Mokattam",
    "location": "mokkattam",
    "address": "456 Mokattam Hills, Cairo, Egypt",
    "area": "45.75",
    "number": "S-201",
    "price": "3500.00",
    "bedrooms": 1,
    "bathrooms": "private",
    "description": "Modern studio apartment perfect for young professionals",
    "photos_url": [
      "https://example.com/photos/studio-main.jpg",
      "https://example.com/photos/studio-kitchen.jpg"
    ],
    "location_on_map": "https://maps.google.com/example2",
    "facilities_amenities": "24/7 Security, Elevator, Balcony, Air Conditioning",
    "floor": 5,
    "total_parts": 3,
    "contact_number": "+201234567890",
    "listed_by_admin_id": 4,
    "created_at": "2025-09-05T20:10:47",
    "updated_at": null
  }
]
```

#### GET `/api/v1/apartments/rent/{apartment_id}`
**Purpose:** Get specific rent apartment by ID

#### POST `/api/v1/apartments/rent`
**Purpose:** Create new rent apartment (admin only)

**Request:**
```json
{
  "name": "Luxury Studio in Maadi",
  "location": "maadi",
  "address": "123 Maadi Corniche, Cairo, Egypt",
  "area": "50.0",
  "number": "S-301",
  "price": "4000.00",
  "bedrooms": 1,
  "bathrooms": "private",
  "description": "Luxury studio with modern amenities",
  "photos_url": [
    "https://example.com/photos/luxury-studio-1.jpg",
    "https://example.com/photos/luxury-studio-2.jpg"
  ],
  "location_on_map": "https://maps.google.com/example3",
  "facilities_amenities": "24/7 Security, Elevator, Balcony, Air Conditioning, Gym",
  "floor": 8,
  "total_parts": 2
}
```

**Required Fields:**
- `name` (string)
- `location` (enum: "maadi" | "mokkattam")
- `address` (string)
- `area` (string, decimal)
- `number` (string)
- `price` (string, decimal)
- `bedrooms` (number)
- `bathrooms` (enum: "private" | "shared")
- `floor` (integer)
- `total_parts` (integer)

**Optional Fields:**
- `description` (string)
- `photos_url` (array of strings)
- `location_on_map` (string)
- `facilities_amenities` (string)

**Response:**
```json
{
  "id": 1,
  "name": "Luxury Studio in Maadi",
  "location": "maadi",
  "address": "123 Maadi Corniche, Cairo, Egypt",
  "area": "50.0",
  "number": "S-301",
  "price": "4000.00",
  "bedrooms": 1,
  "bathrooms": "private",
  "description": "Luxury studio with modern amenities",
  "photos_url": [
    "https://example.com/photos/luxury-studio-1.jpg",
    "https://example.com/photos/luxury-studio-2.jpg"
  ],
  "location_on_map": "https://maps.google.com/example3",
  "facilities_amenities": "24/7 Security, Elevator, Balcony, Air Conditioning, Gym",
  "floor": 8,
  "total_parts": 2,
  "contact_number": "+201234567890",
  "listed_by_admin_id": 1,
  "created_at": "2025-09-05T20:25:15",
  "updated_at": null
}
```

#### PUT `/api/v1/apartments/rent/{apartment_id}`
**Purpose:** Update rent apartment (admin only)

**Authorization Rules:**
- Master admin: Can update any apartment
- Regular admin: Can only update apartments they created

**Request:**
```json
{
  "name": "Updated Studio Name",
  "price": "4500.00",
  "description": "Updated description"
}
```

**Error Cases:**
- `403`: "Only the admin who created the apartment can update it"

#### DELETE `/api/v1/apartments/rent/{apartment_id}`
**Purpose:** Delete rent apartment (admin only)

**Authorization Rules:**
- Master admin: Can delete any apartment
- Regular admin: Can only delete apartments they created

### Sale Apartment Endpoints

#### GET `/api/v1/apartments/sale`
**Purpose:** Get list of all sale apartments

**Query Parameters:**
- `skip` (number, optional): Records to skip (default: 0)
- `limit` (number, optional): Max records (default: 100)

**Response:**
```json
[
  {
    "id": 1,
    "name": "3BR Villa in Green Valley",
    "location": "mokkattam",
    "address": "789 Green Valley, Cairo, Egypt",
    "area": "120.5",
    "number": "V-101",
    "price": "465000.00",
    "bedrooms": 3,
    "bathrooms": "private",
    "description": "Beautiful 3-bedroom villa with garden",
    "photos_url": [
      "https://example.com/photos/villa-exterior.jpg",
      "https://example.com/photos/villa-interior.jpg"
    ],
    "location_on_map": "https://maps.google.com/example4",
    "facilities_amenities": "Garden, Parking, Security, Air Conditioning",
    "contact_number": "+201234567890",
    "listed_by_admin_id": 1,
    "created_at": "2025-09-05T20:35:10",
    "updated_at": null
  }
]
```

#### GET `/api/v1/apartments/sale/{apartment_id}`
**Purpose:** Get specific sale apartment by ID

**Response:**
```json
{
  "id": 1,
  "name": "3BR Villa in Green Valley",
  "location": "mokkattam",
  "address": "789 Green Valley, Cairo, Egypt",
  "area": "120.5",
  "number": "V-101",
  "price": "465000.00",
  "bedrooms": 3,
  "bathrooms": "private",
  "description": "Beautiful 3-bedroom villa with garden",
  "photos_url": [
    "https://example.com/photos/villa-exterior.jpg",
    "https://example.com/photos/villa-interior.jpg"
  ],
  "location_on_map": "https://maps.google.com/example4",
  "facilities_amenities": "Garden, Parking, Security, Air Conditioning",
  "contact_number": "+201234567890",
  "listed_by_admin_id": 1,
  "created_at": "2025-09-05T20:35:10",
  "updated_at": null
}
```

#### POST `/api/v1/apartments/sale`
**Purpose:** Create new sale apartment (admin only)

**Request:**
```json
{
  "name": "2BR Apartment in Maadi",
  "location": "maadi",
  "address": "456 Maadi Street, Cairo, Egypt",
  "area": "85.0",
  "number": "A-201",
  "price": "250000.00",
  "bedrooms": 2,
  "bathrooms": "private",
  "description": "Modern 2-bedroom apartment",
  "photos_url": [
    "https://example.com/photos/apartment-1.jpg",
    "https://example.com/photos/apartment-2.jpg"
  ],
  "location_on_map": "https://maps.google.com/example5",
  "facilities_amenities": "Elevator, Security, Air Conditioning"
}
```

**Response:**
```json
{
  "id": 2,
  "name": "2BR Apartment in Maadi",
  "location": "maadi",
  "address": "456 Maadi Street, Cairo, Egypt",
  "area": "85.0",
  "number": "A-201",
  "price": "250000.00",
  "bedrooms": 2,
  "bathrooms": "private",
  "description": "Modern 2-bedroom apartment",
  "photos_url": [
    "https://example.com/photos/apartment-1.jpg",
    "https://example.com/photos/apartment-2.jpg"
  ],
  "location_on_map": "https://maps.google.com/example5",
  "facilities_amenities": "Elevator, Security, Air Conditioning",
  "contact_number": "+201234567890",
  "listed_by_admin_id": 1,
  "created_at": "2025-09-05T20:40:25",
  "updated_at": null
}
```

#### PUT `/api/v1/apartments/sale/{apartment_id}`
**Purpose:** Update sale apartment (admin only)

**Authorization Rules:**
- Master admin: Can update any apartment
- Regular admin: Can only update apartments they created

**Request:**
```json
{
  "name": "Updated Apartment Name",
  "price": "275000.00",
  "description": "Updated description"
}
```

**Response:**
```json
{
  "id": 2,
  "name": "Updated Apartment Name",
  "location": "maadi",
  "address": "456 Maadi Street, Cairo, Egypt",
  "area": "85.0",
  "number": "A-201",
  "price": "275000.00",
  "bedrooms": 2,
  "bathrooms": "private",
  "description": "Updated description",
  "photos_url": [
    "https://example.com/photos/apartment-1.jpg",
    "https://example.com/photos/apartment-2.jpg"
  ],
  "location_on_map": "https://maps.google.com/example5",
  "facilities_amenities": "Elevator, Security, Air Conditioning",
  "floor": 3,
  "total_parts": 1,
  "contact_number": "+201234567890",
  "listed_by_admin_id": 1,
  "created_at": "2025-09-05T20:40:25",
  "updated_at": "2025-09-05T20:45:30"
}
```

#### DELETE `/api/v1/apartments/sale/{apartment_id}`
**Purpose:** Delete sale apartment (admin only)

**Authorization Rules:**
- Master admin: Can delete any apartment
- Regular admin: Can only delete apartments they created

**Response:**
```json
{
  "message": "Apartment deleted successfully"
}
```

### Apartment Parts (Studios) Management

#### GET `/api/v1/apartments/parts`
**Purpose:** Get list of all apartment parts

**Query Parameters:**
- `skip` (number, optional): Records to skip (default: 0)
- `limit` (number, optional): Max records (default: 100)

**Response:**
```json
[
  {
    "id": 1,
    "apartment_id": 1,
    "status": "available",
    "title": "Studio S-101",
    "area": "30.00",
    "floor": 5,
    "monthly_price": "3500.00",
    "bedrooms": 1,
    "bathrooms": "private",
    "furnished": "yes",
    "balcony": "yes",
    "description": "Modern studio with great amenities",
    "photos_url": ["https://example.com/studio1.jpg"],
    "created_by_admin_id": 1,
    "created_at": "2025-09-05T20:50:15",
    "updated_at": null
  }
]
```

#### GET `/api/v1/apartments/parts/{part_id}`
**Purpose:** Get specific apartment part by ID

**Response:**
```json
{
  "id": 1,
  "apartment_id": 1,
  "status": "available",
  "title": "Studio S-101",
  "area": "30.00",
  "floor": 5,
  "monthly_price": "3500.00",
  "bedrooms": 1,
  "bathrooms": "private",
  "furnished": "yes",
  "balcony": "yes",
  "description": "Modern studio with great amenities",
  "photos_url": ["https://example.com/studio1.jpg"],
  "created_by_admin_id": 1,
  "created_at": "2025-09-05T20:50:15",
  "updated_at": null
}
```

#### POST `/api/v1/apartments/rent/{apartment_id}/parts`
**Purpose:** Create new apartment part for rent apartment (admin only)

**Request:**
```json
{
  "title": "Studio S-102",
  "area": "35.00",
  "monthly_price": "3800.00",
  "bedrooms": 1,
  "bathrooms": "private",
  "furnished": "yes",
  "balcony": "no",
  "description": "Spacious studio with modern amenities",
  "photos_url": [
    "https://example.com/photos/studio-1.jpg"
  ]
}
```

**Response:**
```json
{
  "id": 2,
  "apartment_id": 1,
  "status": "available",
  "title": "Studio S-102",
  "area": "35.00",
  "floor": 5,
  "monthly_price": "3800.00",
  "bedrooms": 1,
  "bathrooms": "private",
  "furnished": "yes",
  "balcony": "no",
  "description": "Spacious studio with modern amenities",
  "photos_url": [
    "https://example.com/photos/studio-1.jpg"
  ],
  "created_by_admin_id": 1,
  "created_at": "2025-09-05T20:55:20",
  "updated_at": null
}
```

**Authorization Rules:**
- Master admin: Can create parts for any apartment
- Regular admin: Can only create parts for apartments they created

#### PUT `/api/v1/apartments/parts/{part_id}`
**Purpose:** Update apartment part (admin only)

**Authorization Rules:**
- Master admin: Can update parts for any apartment
- Regular admin: Can only update parts for apartments they created

**Request:**
```json
{
  "title": "Studio S-102A",
  "monthly_price": "4000.00",
  "status": "rented"
}
```

**Response:**
```json
{
  "id": 2,
  "apartment_id": 1,
  "status": "rented",
  "title": "Studio S-102A",
  "area": "35.00",
  "floor": 5,
  "monthly_price": "4000.00",
  "bedrooms": 1,
  "bathrooms": "private",
  "furnished": "yes",
  "balcony": "no",
  "description": "Spacious studio with modern amenities",
  "photos_url": null,
  "created_by_admin_id": 1,
  "created_at": "2025-09-05T20:55:20",
  "updated_at": "2025-09-05T21:00:25"
}
```

#### DELETE `/api/v1/apartments/parts/{part_id}`
**Purpose:** Delete apartment part (admin only)

**Authorization Rules:**
- Master admin: Can delete parts for any apartment
- Regular admin: Can only delete parts for apartments they created

**Response:**
```json
{
  "id": 2,
  "apartment_id": 1,
  "status": "rented",
  "title": "Studio S-102A",
  "area": "35.00",
  "floor": 5,
  "monthly_price": "4000.00",
  "bedrooms": 1,
  "bathrooms": "private",
  "furnished": "yes",
  "balcony": "no",
  "description": "Spacious studio with modern amenities",
  "photos_url": null,
  "created_by_admin_id": 1,
  "created_at": "2025-09-05T20:55:20",
  "updated_at": "2025-09-05T21:00:25"
}
```

#### GET `/api/v1/apartments/rent/{apartment_id}/whatsapp`
**Purpose:** Get admin's phone number for apartment inquiry (accessible by guests)

**Response:**
```json
{
  "admin_phone": "+201234567890"
}
```

### Admin's Own Content

#### GET `/api/v1/apartments/my-content`
**Purpose:** Get apartments and studios created by the requesting admin

**Behavior:**
- Master admin: Sees all apartments from all admins
- Regular admin: Sees only their own apartments

**Query Parameters:**
- `skip` (number, optional): Records to skip (default: 0)
- `limit` (number, optional): Max records (default: 100)

**Response:**
```json
{
  "rent_apartments": [
    {
      "id": 1,
      "name": "Test Apartment",
      "location": "maadi",
      "address": "123 Test Street, Cairo, Egypt",
      "area": "50.00",
      "number": "T-101",
      "price": "3000.00",
      "bedrooms": 1,
      "bathrooms": "private",
      "description": "Test apartment description",
      "photos_url": ["https://example.com/test1.jpg"],
      "location_on_map": "https://maps.google.com/test",
      "facilities_amenities": "Test amenities",
      "contact_number": "+201111111111",
      "listed_by_admin_id": 1,
      "created_at": "2025-09-05T21:01:51",
      "updated_at": null,
      "apartment_parts": [
        {
          "id": 1,
          "apartment_id": 1,
          "status": "available",
          "title": "Studio T-101A",
          "area": "30.00",
          "floor": 1,
          "monthly_price": "3000.00",
          "bedrooms": 1,
          "bathrooms": "private",
          "furnished": "yes",
          "balcony": "yes",
          "description": "Test studio description",
          "photos_url": ["https://example.com/studio1.jpg"],
          "created_by_admin_id": 1,
          "created_at": "2025-09-05T21:02:05",
          "updated_at": null
        }
      ]
    }
  ],
  "sale_apartments": [
    {
      "id": 1,
      "name": "Sale Apartment",
      "location": "mokkattam",
      "address": "456 Sale Street, Cairo, Egypt",
      "area": "85.0",
      "number": "A-201",
      "price": "250000.00",
      "bedrooms": 2,
      "bathrooms": "private",
      "description": "Sale apartment description",
      "photos_url": ["https://example.com/sale1.jpg"],
      "location_on_map": "https://maps.google.com/sale",
      "facilities_amenities": "Elevator, Security, Air Conditioning",
      "contact_number": "+201234567890",
      "listed_by_admin_id": 1,
      "created_at": "2025-09-05T20:40:25",
      "updated_at": null
    }
  ],
  "total_rent_apartments": 1,
  "total_sale_apartments": 1,
  "total_studios": 1
}
```

### Rental Contracts Management

#### GET `/api/v1/rental-contracts/`
**Purpose:** Get list of all rental contracts (admin only)

**Query Parameters:**
- `skip` (number, optional): Records to skip
- `limit` (number, optional): Max records
- `apartment_id` (number, optional): Filter by apartment ID
- `is_active` (boolean, optional): Filter by active status

**Response:**
```json
[
  {
    "id": 1,
    "apartment_part_id": 1,
    "customer_name": "John Doe",
    "customer_phone": "+201234567890",
    "customer_id_number": "12345678901234",
    "how_did_customer_find_us": "facebook",
    "paid_deposit": "3500.00",
    "warrant_amount": "3500.00",
    "rent_start_date": "2025-09-01",
    "rent_end_date": "2026-08-31",
    "rent_period": 12,
    "contract_url": "https://example.com/contracts/contract1.pdf",
    "customer_id_url": "https://example.com/documents/id1.jpg",
    "commission": "350.00",
    "rent_price": "3500.00",
    "is_active": true,
    "created_by_admin_id": 1,
    "created_at": "2025-09-05T21:05:30",
    "updated_at": null
  }
]
```

#### GET `/api/v1/rental-contracts/by-studio`
**Purpose:** Get rental contracts ordered by studio number (latest first)

**Query Parameters:**
- `skip` (number, optional): Records to skip
- `limit` (number, optional): Max records
- `apartment_id` (number, optional): Filter by apartment ID
- `is_active` (boolean, optional): Filter by active status

**Response:**
```json
[
  {
    "id": 3,
    "apartment_part_id": 3,
    "customer_name": "Alice Johnson",
    "customer_phone": "+201111111111",
    "customer_id_number": "11111111111111",
    "how_did_customer_find_us": "instagram",
    "paid_deposit": "4000.00",
    "warrant_amount": "4000.00",
    "rent_start_date": "2025-10-01",
    "rent_end_date": "2026-09-30",
    "rent_period": 12,
    "contract_url": "https://example.com/contracts/contract3.pdf",
    "customer_id_url": "https://example.com/documents/id3.jpg",
    "commission": "400.00",
    "rent_price": "4000.00",
    "is_active": true,
    "created_by_admin_id": 1,
    "created_at": "2025-09-05T21:15:45",
    "updated_at": null
  },
  {
    "id": 2,
    "apartment_part_id": 2,
    "customer_name": "Jane Smith",
    "customer_phone": "+201987654321",
    "customer_id_number": "98765432109876",
    "how_did_customer_find_us": "google",
    "paid_deposit": "3800.00",
    "warrant_amount": "3800.00",
    "rent_start_date": "2025-09-15",
    "rent_end_date": "2026-09-14",
    "rent_period": 12,
    "contract_url": "https://example.com/contracts/contract2.pdf",
    "customer_id_url": "https://example.com/documents/id2.jpg",
    "commission": "380.00",
    "rent_price": "3800.00",
    "is_active": true,
    "created_by_admin_id": 1,
    "created_at": "2025-09-05T21:10:30",
    "updated_at": null
  }
]
```

#### GET `/api/v1/rental-contracts/{contract_id}`
**Purpose:** Get specific rental contract by ID

**Response:**
```json
{
  "id": 1,
  "apartment_part_id": 1,
  "customer_name": "John Doe",
  "customer_phone": "+201234567890",
  "customer_id_number": "12345678901234",
  "how_did_customer_find_us": "facebook",
  "paid_deposit": "3500.00",
  "warrant_amount": "3500.00",
  "rent_start_date": "2025-09-01",
  "rent_end_date": "2026-08-31",
  "rent_period": 12,
  "contract_url": "https://example.com/contracts/contract1.pdf",
  "customer_id_url": "https://example.com/documents/id1.jpg",
  "commission": "350.00",
  "rent_price": "3500.00",
  "is_active": true,
  "created_by_admin_id": 1,
  "created_at": "2025-09-05T21:05:30",
  "updated_at": null
}
```

#### POST `/api/v1/rental-contracts/`
**Purpose:** Create new rental contract (admin only)

**Request:**
```json
{
  "apartment_part_id": 1,
  "customer_name": "Jane Smith",
  "customer_phone": "+201987654321",
  "customer_id_number": "98765432109876",
  "how_did_customer_find_us": "instagram",
  "paid_deposit": "3800.00",
  "warrant_amount": "3800.00",
  "rent_start_date": "2025-10-01",
  "rent_end_date": "2026-09-30",
  "rent_period": 12,
  "contract_url": "https://example.com/contracts/contract2.pdf",
  "customer_id_url": "https://example.com/documents/id2.jpg",
  "commission": "380.00",
  "rent_price": "3800.00"
}
```

**Required Fields:**
- `apartment_part_id` (integer)
- `customer_name` (string)
- `customer_phone` (string)
- `customer_id_number` (string)
- `how_did_customer_find_us` (enum: "facebook" | "instagram" | "google" | "referral" | "walk_in" | "other")
- `paid_deposit` (decimal as string)
- `warrant_amount` (decimal as string)
- `rent_start_date` (date: "YYYY-MM-DD")
- `rent_end_date` (date: "YYYY-MM-DD")
- `rent_period` (integer: months)
- `commission` (decimal as string)
- `rent_price` (decimal as string)

**Optional Fields:**
- `contract_url` (string: URL to contract document)
- `customer_id_url` (string: URL to customer ID document)

**Response:**
```json
{
  "id": 2,
  "apartment_part_id": 1,
  "customer_name": "Jane Smith",
  "customer_phone": "+201987654321",
  "customer_id_number": "98765432109876",
  "how_did_customer_find_us": "instagram",
  "paid_deposit": "3800.00",
  "warrant_amount": "3800.00",
  "rent_start_date": "2025-10-01",
  "rent_end_date": "2026-09-30",
  "rent_period": 12,
  "contract_url": "https://example.com/contracts/contract2.pdf",
  "customer_id_url": "https://example.com/documents/id2.jpg",
  "commission": "380.00",
  "rent_price": "3800.00",
  "is_active": true,
  "created_by_admin_id": 1,
  "created_at": "2025-09-05T21:10:45",
  "updated_at": null
}
```

**Authorization Rules:**
- Master admin: Can create contracts for any apartment
- Regular admin: Can only create contracts for apartments they created

#### PUT `/api/v1/rental-contracts/{contract_id}`
**Purpose:** Update rental contract (admin only)

**Request:**
```json
{
  "customer_name": "Jane Smith Updated",
  "rent_price": "4000.00",
  "is_active": false
}
```

**Response:**
```json
{
  "id": 2,
  "apartment_part_id": 1,
  "customer_name": "Jane Smith Updated",
  "customer_phone": "+201987654321",
  "customer_id_number": "98765432109876",
  "how_did_customer_find_us": "instagram",
  "paid_deposit": "3800.00",
  "warrant_amount": "3800.00",
  "rent_start_date": "2025-10-01",
  "rent_end_date": "2026-09-30",
  "rent_period": 12,
  "contract_url": "https://example.com/contracts/contract2.pdf",
  "customer_id_url": "https://example.com/documents/id2.jpg",
  "commission": "380.00",
  "rent_price": "4000.00",
  "is_active": false,
  "created_by_admin_id": 1,
  "created_at": "2025-09-05T21:10:45",
  "updated_at": "2025-09-05T21:15:50"
}
```

#### DELETE `/api/v1/rental-contracts/{contract_id}`
**Purpose:** Delete rental contract (super admin only)

**Response:**
```json
{
  "message": "Rental contract deleted successfully"
}
```

## 📊 Data Types and Enums

### Admin Roles
```javascript
const AdminRoles = {
  SUPER_ADMIN: 'super_admin',
  STUDIO_RENTAL: 'studio_rental',
  APARTMENT_SALE: 'apartment_sale'
};
```

### Locations
```javascript
const Locations = {
  MAADI: 'maadi',
  MOKKATTAM: 'mokkattam'
};
```

### Bathroom Types
```javascript
const BathroomTypes = {
  PRIVATE: 'private',
  SHARED: 'shared'
};
```

### Part Status
```javascript
const PartStatus = {
  AVAILABLE: 'available',
  RENTED: 'rented',
  UPCOMING_END: 'upcoming_end'
};
```

### Furnished Status
```javascript
const FurnishedStatus = {
  YES: 'yes',
  NO: 'no'
};
```

### Balcony Types
```javascript
const BalconyTypes = {
  YES: 'yes',
  SHARED: 'shared',
  NO: 'no'
};
```

### Customer Sources
```javascript
const CustomerSources = {
  FACEBOOK: 'facebook',
  INSTAGRAM: 'instagram',
  GOOGLE: 'google',
  REFERRAL: 'referral',
  WALK_IN: 'walk_in',
  OTHER: 'other'
};
```

## ⚠️ Error Handling

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `422`: Validation Error
- `500`: Internal Server Error

### Common Error Messages
```javascript
const ErrorMessages = {
  INVALID_CREDENTIALS: "Could not validate credentials",
  NOT_AUTHENTICATED: "Not authenticated",
  INSUFFICIENT_PERMISSIONS: "Insufficient permissions",
  EMAIL_EXISTS: "Email already registered",
  PHONE_EXISTS: "Phone number already registered",
  APARTMENT_NOT_FOUND: "Apartment not found",
  ADMIN_NOT_FOUND: "Admin not found",
  CONTRACT_NOT_FOUND: "Rental contract not found",
  UNAUTHORIZED_APARTMENT_ACCESS: "Only the admin who created the apartment can access it",
  UNAUTHORIZED_CONTRACT_CREATION: "Only the admin who created the apartment can create contracts for its studios"
};
```

### Error Response Examples

#### 401 Unauthorized
```json
{
  "detail": "Could not validate credentials"
}
```

#### 403 Forbidden
```json
{
  "detail": "Only the admin who created the apartment can update it"
}
```

#### 422 Validation Error
```json
{
  "detail": [
    {
      "type": "missing",
      "loc": ["body", "name"],
      "msg": "Field required",
      "input": null
    }
  ]
}
```

## 🔒 Authorization Rules

### Master Admin (super_admin)
- **Full Access**: Can perform all operations on all content
- **View All**: Sees all apartments, studios, and contracts from all admins
- **Create/Update/Delete**: Can modify any apartment, studio, or contract
- **Admin Management**: Can create, update, and delete other admins

### Regular Admins (studio_rental, apartment_sale)
- **Limited Access**: Can only manage content they created
- **View Own**: Only sees their own apartments, studios, and contracts
- **Create**: Can create new apartments and studios
- **Update/Delete**: Can only modify content they created
- **No Admin Management**: Cannot manage other admins

### Authorization Rules Summary

| Action | Master Admin | Regular Admin |
|--------|-------------|---------------|
| View All Content | ✅ Yes | ❌ Only Own Content |
| Create Content | ✅ Anywhere | ✅ Anywhere |
| Update Content | ✅ Any Content | ❌ Only Own Content |
| Delete Content | ✅ Any Content | ❌ Only Own Content |
| Manage Admins | ✅ Yes | ❌ No |

## 📱 API Usage Examples

### Complete Request/Response Examples

#### Login Request
**Method:** `POST`  
**URL:** `http://localhost:8000/api/v1/auth/login`  
**Content-Type:** `application/x-www-form-urlencoded`

**Request Body:**
```
username=admin@example.com&password=password123
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

#### Create Apartment Request
**Method:** `POST`  
**URL:** `http://localhost:8000/api/v1/apartments/rent`  
**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Luxury Studio in Maadi",
  "location": "maadi",
  "address": "123 Maadi Corniche, Cairo, Egypt",
  "area": "50.0",
  "number": "S-301",
  "price": "4000.00",
  "bedrooms": 1,
  "bathrooms": "private",
  "description": "Luxury studio with modern amenities",
  "photos_url": [
    "https://example.com/photos/luxury-studio-1.jpg",
    "https://example.com/photos/luxury-studio-2.jpg"
  ],
  "location_on_map": "https://maps.google.com/example3",
  "facilities_amenities": "24/7 Security, Elevator, Balcony, Air Conditioning, Gym",
  "floor": 8,
  "total_parts": 2
}
```

**Response:**
```json
{
  "id": 2,
  "name": "Luxury Studio in Maadi",
  "location": "maadi",
  "address": "123 Maadi Corniche, Cairo, Egypt",
  "area": "50.0",
  "number": "S-301",
  "price": "4000.00",
  "bedrooms": 1,
  "bathrooms": "private",
  "description": "Luxury studio with modern amenities",
  "photos_url": [
    "https://example.com/photos/luxury-studio-1.jpg",
    "https://example.com/photos/luxury-studio-2.jpg"
  ],
  "location_on_map": "https://maps.google.com/example3",
  "facilities_amenities": "24/7 Security, Elevator, Balcony, Air Conditioning, Gym",
  "floor": 8,
  "total_parts": 2,
  "contact_number": "+201234567890",
  "listed_by_admin_id": 1,
  "created_at": "2025-09-05T20:25:15",
  "updated_at": null
}
```

### File Upload Endpoints

#### POST `/api/v1/uploads/photos`
**Purpose:** Upload photos for apartments/parts (admin only)

**Request (Form Data):**
```
entity_id: 1
entity_type: rent  // or "sale" or "part"
files: [File1, File2, ...]
```

**Response:**
```json
{
  "entity_id": 1,
  "entity_type": "rent",
  "count": 2,
  "files": [
    {
      "key": "rent/1/abc123.jpg",
      "url": "/uploads/rent/1/abc123.jpg"
    },
    {
      "key": "rent/1/def456.jpg", 
      "url": "/uploads/rent/1/def456.jpg"
    }
  ],
  "folder_key": "rent/1/",
  "saved_to_db": true
}
```

**Notes:**
- Files are automatically added to the entity's `photos_url` array
- Supports multiple file upload
- Files are stored with unique names to prevent conflicts
- `entity_type` must be one of: "rent", "sale", "part"

## 🚨 Important Limitations

### 1. File Uploads
- **Direct File Upload Available**: Use `POST /uploads/photos` endpoint
- **Alternative**: Upload files to external service first, then send URLs to API
- **Supported**: Local storage (default) or AWS S3 (configurable)

### 2. Pagination
- **Default Limit**: 100 records per request
- **Maximum**: No hard limit specified, but recommend reasonable limits
- **Implementation**: Always implement pagination for large datasets

### 3. Rate Limiting
- **Current Status**: No rate limits implemented
- **Recommendation**: Implement client-side rate limiting for production

### 4. Token Expiration
- **JWT Tokens**: Have expiration time
- **Implementation**: Implement token refresh logic or re-authentication

### 5. Data Validation
- **Client-Side**: Always validate data before sending to API
- **Server-Side**: API will return 422 errors for invalid data
- **Required Fields**: Check API documentation for required fields

### 6. Authorization
- **Role-Based**: Different admin roles have different permissions
- **Content Ownership**: Regular admins can only manage their own content
- **Implementation**: Always check permissions before showing UI elements

## 🔧 Development Tips

### 1. Environment Configuration
**Development:**
- Base URL: `http://localhost:8000/api/v1`
- Timeout: 10000ms

**Production:**
- Base URL: `https://your-api-domain.com/api/v1`
- Timeout: 30000ms

### 2. Required Headers
All authenticated requests must include:
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

### 3. Data Validation Rules
**Apartment Creation:**
- `name`: Required, non-empty string
- `location`: Required, must be "maadi" or "mokkattam"
- `price`: Required, must be a valid decimal number
- `photos_url`: Required, must be array with at least one URL
- `bedrooms`: Required, must be positive integer
- `bathrooms`: Required, must be "private" or "shared"

### 4. Error Handling
**Common HTTP Status Codes:**
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized (invalid/expired token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `422`: Validation Error
- `500`: Internal Server Error

## 📞 Support and Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your frontend domain is allowed in the API CORS settings
2. **Token Expiration**: Implement proper token refresh or re-authentication
3. **Validation Errors**: Check that all required fields are provided and in correct format
4. **Authorization Errors**: Verify that the admin has the required role and permissions
5. **Network Errors**: Implement proper error handling and retry logic

### Debugging Tips

1. **Check Network Tab**: Inspect request/response headers and body
2. **Console Logs**: Log API responses for debugging
3. **Token Validation**: Verify JWT token is valid and not expired
4. **Role Verification**: Check admin role and permissions before making requests

---

**Note**: This documentation is based on the current API implementation. Always test endpoints thoroughly and handle edge cases appropriately in your frontend application.
