# Photo Upload API Documentation

## Overview
This document describes the photo upload functionality for the real estate management system.

## Endpoint
**POST** `/api/upload/photo`

## Authentication
Required: Bearer Token in Authorization header

## Request Format

### Headers
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

### Body Parameters
- `photo` (file, required): The image file to upload
  - Supported formats: JPG, JPEG, PNG, GIF, WEBP
  - Maximum file size: 5MB
  - File field name: `photo`

### Example Request
```javascript
const formData = new FormData();
formData.append('photo', fileInput.files[0]);

fetch('/api/upload/photo', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
})
```

## Response Format

### Success Response (200 OK)
```json
{
  "success": true,
  "file_url": "https://your-domain.com/uploads/photos/filename.jpg",
  "file_path": "/uploads/photos/filename.jpg",
  "filename": "filename.jpg"
}
```

### Error Responses

#### No File Uploaded (400 Bad Request)
```json
{
  "detail": "No photo file provided"
}
```

#### Invalid File Type (400 Bad Request)
```json
{
  "detail": "Invalid file type. Supported formats: jpg, jpeg, png, gif, webp"
}
```

#### File Too Large (400 Bad Request)
```json
{
  "detail": "File size exceeds maximum limit of 5MB"
}
```

#### Unauthorized (401 Unauthorized)
```json
{
  "detail": "Not authenticated"
}
```

#### Server Error (500 Internal Server Error)
```json
{
  "detail": "Failed to upload photo",
  "error": "Error message details"
}
```

## Usage Examples

### React Example
```jsx
import { useState } from 'react';

function PhotoUpload() {
  const [uploading, setUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('photo', file);

    try {
      const token = localStorage.getItem('api_access_token');
      const response = await fetch('/api/upload/photo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        setPhotoUrl(data.file_url);
        console.log('Photo uploaded:', data.file_url);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleUpload}
        disabled={uploading}
      />
      {uploading && <p>Uploading...</p>}
      {photoUrl && <img src={photoUrl} alt="Uploaded" />}
    </div>
  );
}
```

### Axios Example
```javascript
import axios from 'axios';

async function uploadPhoto(file, token) {
  const formData = new FormData();
  formData.append('photo', file);

  try {
    const response = await axios.post('/api/upload/photo', formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Upload error:', error.response?.data);
    throw error;
  }
}
```

## Validation Rules

1. **File Presence**: A file must be included in the request
2. **File Type**: Only image formats are accepted (jpg, jpeg, png, gif, webp)
3. **File Size**: Maximum 5MB per file
4. **Authentication**: Valid bearer token required
5. **File Name**: Automatically sanitized and made unique with timestamp

## Storage Location
- Uploaded files are stored in: `/uploads/photos/`
- File naming convention: `{timestamp}_{original_filename}`
- Full URL is returned in the response

## Best Practices

1. **Validate file on client side** before uploading
   - Check file type
   - Check file size
   - Show preview to user

2. **Handle errors gracefully**
   - Show user-friendly error messages
   - Retry logic for network failures
   - Fallback for unsupported formats

3. **Show upload progress**
   - Use progress indicators
   - Disable form during upload
   - Provide feedback on completion

4. **Security considerations**
   - Always validate token
   - Sanitize file names
   - Store files outside web root when possible
   - Implement rate limiting

## Notes

- Multiple file uploads require multiple API calls
- Photos are not automatically associated with properties - you must link them separately
- Uploaded photos are not automatically deleted - implement cleanup if needed
- Consider implementing image optimization/resizing on the backend
- For galleries, upload multiple photos sequentially and collect URLs
