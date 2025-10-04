import React, { useState } from 'react';
import './AddApartmentModal.css';
import heroImg from '../../../assets/images/backgrounds/LP.jpg';
import useUniqueId from '../../../hooks/useUniqueId';
import { usePropertyManagement } from '../../../hooks/usePropertyManagement';
import { useAdminAuth } from '../../../hooks/useRedux';

const AddApartmentModal = ({ isOpen, onApartmentAdded, onClose }) => {
  const { generateApartmentId } = useUniqueId();
  const { createRentApartment } = usePropertyManagement(); // Use real API call
  const { currentAdmin } = useAdminAuth();
  const [formData, setFormData] = useState({
    name: '',
    location: 'maadi', // Set default location
    address: '',
    description: '',
    mapUrl: '',
    facilities: [],
    floor: '1', // Set default floor as string
    photos: [],
    area: '50', // Set default area
    number: '',
    price: '0', // Set default price
    bedrooms: '1',
    bathrooms: 'private',
    totalParts: '1'
  });

  const [facilityInput, setFacilityInput] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Don't render if modal is not open
  if (!isOpen) return null;

  // Helper function to validate URL
  const isValidUrl = (string) => {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
      return false;
    }
  };

  const commonFacilities = [
    'Swimming Pool', 'Gym', 'Security', 'Parking', 'Garden', 
    'Concierge', 'Spa', 'Business Center', 'Rooftop Pool', 
    'Children\'s Area', 'Community Center', 'Valet Parking'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Convert files to base64 URLs for preview
    const fileReaders = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({
            file: file,
            preview: e.target.result,
            name: file.name
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(fileReaders).then(results => {
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, ...results]
      }));
    });

    // Clear error when user uploads photos
    if (errors.photos) {
      setErrors(prev => ({
        ...prev,
        photos: ''
      }));
    }
  };

  const removePhoto = (index) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const addFacility = (facility) => {
    if (facility && !formData.facilities.includes(facility)) {
      setFormData(prev => ({
        ...prev,
        facilities: [...prev.facilities, facility]
      }));
      setFacilityInput('');
    }
  };

  const removeFacility = (facilityToRemove) => {
    setFormData(prev => ({
      ...prev,
      facilities: prev.facilities.filter(facility => facility !== facilityToRemove)
    }));
  };

  const handleFacilityInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addFacility(facilityInput);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Basic required field validation with API field references
    if (!formData.name?.trim()) {
      newErrors.name = 'Apartment name is required (API field: name)';
    } else {
      console.log('✅ Apartment name validation passed:', formData.name);
    }

    if (!formData.location || !formData.location.trim() || (formData.location !== 'maadi' && formData.location !== 'mokkattam')) {
      newErrors.location = 'Location is required and must be either "maadi" or "mokkattam" (API enum requirement)';
    } else {
      console.log('✅ Location validation passed:', formData.location);
    }

    if (!formData.address?.trim()) {
      newErrors.address = 'Address is required (API field: address)';
    } else {
      console.log('✅ Address validation passed:', formData.address);
    }

    if (!formData.description?.trim()) {
      newErrors.description = 'Description is required';
    } else {
      console.log('✅ Description validation passed:', formData.description);
    }

    // Price validation (API field: price, expects string)
    if (formData.price && (isNaN(Number(formData.price)) || Number(formData.price) < 0)) {
      newErrors.price = 'Price must be a valid non-negative number (API expects string)';
    } else if (formData.price) {
      console.log('✅ Price validation passed:', formData.price);
    }

    // Bedrooms validation (API field: bedrooms, expects integer)
    if (formData.bedrooms && (isNaN(Number(formData.bedrooms)) || Number(formData.bedrooms) <= 0 || !Number.isInteger(Number(formData.bedrooms)))) {
      newErrors.bedrooms = 'Bedrooms must be a valid positive integer';
    } else if (formData.bedrooms) {
      console.log('✅ Bedrooms validation passed:', formData.bedrooms);
    }

    // Photos are optional - studios will have their own photos
    // No photo validation required for rental apartments
    // if (formData.photos.length === 0) {
    //   newErrors.photos = 'At least one photo is required for the apartment';
    // }

    // Floor validation - REQUIRED field for rental apartments (API field: floor)
    if (!formData.floor?.toString().trim()) {
      newErrors.floor = 'Floor is required (API field: floor, expects integer)';
    } else if (isNaN(parseInt(formData.floor)) || parseInt(formData.floor) < 0) {
      newErrors.floor = 'Floor must be a valid non-negative integer';
    } else {
      console.log('✅ Floor validation passed:', formData.floor);
    }

    // Number validation - REQUIRED field (API field: number)
    if (!formData.number?.trim()) {
      newErrors.number = 'Apartment number is required (API field: number)';
    } else if (formData.number.trim().length < 1) {
      newErrors.number = 'Apartment number cannot be empty';
    } else {
      console.log('✅ Apartment number validation passed:', formData.number);
    }

    // Bathrooms validation - REQUIRED enum field (API field: bathrooms)
    if (!formData.bathrooms || (formData.bathrooms !== 'private' && formData.bathrooms !== 'shared')) {
      newErrors.bathrooms = 'Bathroom type must be either "private" or "shared" (API enum requirement)';
    } else {
      console.log('✅ Bathroom type validation passed:', formData.bathrooms);
    }

    // Total parts validation - REQUIRED field for rental apartments (API field: total_parts)
    if (!formData.totalParts?.toString().trim()) {
      newErrors.totalParts = 'Total parts/studios is required (API field: total_parts, expects integer)';
    } else if (isNaN(parseInt(formData.totalParts)) || parseInt(formData.totalParts) < 1) {
      newErrors.totalParts = 'Total parts must be at least 1 (positive integer required)';
    } else {
      console.log('✅ Total parts validation passed:', formData.totalParts);
    }

    // Area validation - must be valid if provided (API field: area, expects string)
    if (formData.area && (isNaN(parseFloat(formData.area)) || parseFloat(formData.area) <= 0)) {
      newErrors.area = 'Area must be a valid positive number (API expects string representation)';
    } else if (formData.area) {
      console.log('✅ Area validation passed:', formData.area);
    }

    // Validate mapUrl if provided (optional field)
    if (formData.mapUrl.trim() && !isValidUrl(formData.mapUrl)) {
      newErrors.mapUrl = 'Please enter a valid URL (must start with http:// or https://)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      console.log('❌ Form validation failed - not submitting to API');
      return;
    }

    // FAILSAFE: Double-check essential user fields are filled
    const essentialFields = {
      name: formData.name?.trim(),
      address: formData.address?.trim(),
      number: formData.number?.trim()
    };
    
    const emptyEssentialFields = Object.keys(essentialFields).filter(key => !essentialFields[key]);
    
    if (emptyEssentialFields.length > 0) {
      console.error('❌ CRITICAL: Essential fields are empty:', emptyEssentialFields);
      const fieldNames = {
        name: 'Apartment Name',
        address: 'Address', 
        number: 'Apartment Number'
      };
      const missingFieldNames = emptyEssentialFields.map(f => fieldNames[f]);
      setErrors({ general: `Please fill in: ${missingFieldNames.join(', ')}` });
      return;
    }
    
    // Log what we're about to send
    console.log('📋 Form data before API call:', {
      name: formData.name,
      location: formData.location,
      address: formData.address,
      number: formData.number,
      floor: formData.floor,
      totalParts: formData.totalParts,
      bathrooms: formData.bathrooms
    });

    setIsSubmitting(true);
    console.log('🚀 Creating rental apartment with proper API format...');

    try {
      // Transform form data to match API requirements according to documentation
      // ALL REQUIRED FIELDS: name, location, address, area, number, price, bedrooms, bathrooms, floor, total_parts
      const apiData = {
        name: (formData.name && formData.name.trim()) || 'Unnamed Apartment', // REQUIRED: Never empty
        location: (formData.location && formData.location.toLowerCase()) || 'maadi', // REQUIRED: Never empty
        address: (formData.address && formData.address.trim()) || 'Address not provided', // REQUIRED: Never empty
        area: (formData.area && formData.area.toString().trim()) || '50', // REQUIRED: Never empty, default 50 sqm
        number: (formData.number && formData.number.trim()) || 'APT-001', // REQUIRED: Never empty
        price: (formData.price && formData.price.toString().trim()) || '0', // REQUIRED: Never empty
        bedrooms: parseInt(formData.bedrooms) || 1, // REQUIRED: Always valid integer
        bathrooms: (formData.bathrooms === 'shared') ? 'shared' : 'private', // REQUIRED: Always valid enum
        description: (formData.description && formData.description.trim()) || 'No description provided', // Optional but never empty
        photos_url: formData.photos && formData.photos.length > 0 
          ? formData.photos.map(photo => photo.preview) 
          : [], // Optional: API expects 'photos_url', not 'images'
        location_on_map: formData.mapUrl ? formData.mapUrl.trim() : '', // Optional: API field name
        facilities_amenities: formData.facilities && formData.facilities.length > 0 ? formData.facilities.join(', ') : '', // Optional: API expects string, not array
        floor: parseInt(formData.floor) || 1, // REQUIRED: Always valid integer ≥ 1
        total_parts: parseInt(formData.totalParts) || 1 // REQUIRED: Always valid integer ≥ 1
      };
      
      // Validation: Ensure no field is undefined or null
      const validatedApiData = {
        ...apiData,
        name: apiData.name || 'Unnamed Apartment',
        location: apiData.location || 'maadi',
        address: apiData.address || 'Address not provided',
        area: apiData.area || '50',
        number: apiData.number || 'APT-001',
        price: apiData.price || '0',
        description: apiData.description || 'No description provided'
      };
      
      console.log('📤 API Data prepared:', {
        ...apiData,
        photos_url: apiData.photos_url.length > 0 ? `[${apiData.photos_url.length} photos]` : '[]'
      });
      
      console.log('🔍 EXACT API DATA BEING SENT:');
      console.log('name:', `"${apiData.name}"`);
      console.log('location:', `"${apiData.location}"`);
      console.log('address:', `"${apiData.address}"`);
      console.log('area:', `"${apiData.area}"`);
      console.log('number:', `"${apiData.number}"`);
      console.log('price:', `"${apiData.price}"`);
      console.log('bedrooms:', apiData.bedrooms);
      console.log('bathrooms:', `"${apiData.bathrooms}"`);
      console.log('floor:', apiData.floor);
      console.log('total_parts:', apiData.total_parts);
      console.log('📨 Full JSON being sent to API:', JSON.stringify(apiData, null, 2));
      console.log('bathrooms:', `"${apiData.bathrooms}"`);
      console.log('floor:', apiData.floor);
      console.log('total_parts:', apiData.total_parts);
      console.log('JSON.stringify(apiData):', JSON.stringify(apiData, null, 2));

      // Use real API call to create apartment
      console.log('📤 Final validated API data:', validatedApiData);
      const result = await createRentApartment(validatedApiData);
      
      if (result.success) {
        console.log('✅ Apartment created successfully:', result.apartment);
        
        // Notify parent component and close modal
        onApartmentAdded?.(result.apartment);
        onClose();
        
        // Reset form with proper defaults
        setFormData({
          name: '',
          location: 'maadi', // Keep default location
          address: '',
          description: '',
          mapUrl: '',
          facilities: [],
          floor: '1', // Keep default floor
          photos: [],
          area: '50', // Keep default area
          number: '',
          price: '0', // Keep default price
          bedrooms: '1',
          bathrooms: 'private',
          totalParts: '1'
        });
        
        setErrors({});
      } else {
        console.error('❌ API call failed:', result.message);
        setErrors({ general: result.message || 'Failed to create apartment' });
      }
      
    } catch (error) {
      console.error('💥 Error adding apartment:', error);
      setErrors({ general: 'An error occurred while adding the apartment. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="add-apartment-modal">
        <div className="modal-header">
          <h2>Add New Apartment</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form className="apartment-form" onSubmit={handleSubmit}>
          {errors.general && (
            <div className="error-message general-error">
              {errors.general}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="name">Apartment Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={errors.name ? 'error' : ''}
              placeholder="e.g., Golden Plaza Residences (REQUIRED)"
              required
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="location">Location *</label>
              <select
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className={errors.location ? 'error' : ''}
              >
                <option value="">Select Location</option>
                <option value="maadi">Maadi</option>
                <option value="mokkattam">Mokkattam</option>
              </select>
              {errors.location && <span className="error-text">{errors.location}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="address">Address *</label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className={errors.address ? 'error' : ''}
                placeholder="e.g., 90th Street, New Cairo"
              />
              {errors.address && <span className="error-text">{errors.address}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className={errors.description ? 'error' : ''}
              placeholder="Describe the apartment complex, its features, and unique selling points..."
              rows="4"
            />
            {errors.description && <span className="error-text">{errors.description}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="mapUrl">Google Maps Link</label>
            <input
              type="url"
              id="mapUrl"
              name="mapUrl"
              value={formData.mapUrl}
              onChange={handleInputChange}
              className={errors.mapUrl ? 'error' : ''}
              placeholder="e.g., https://maps.google.com/..."
            />
            {errors.mapUrl && <span className="error-text">{errors.mapUrl}</span>}
            <small className="form-help">
              Optional: Paste the Google Maps link for the apartment location
            </small>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="area">Area (sqm) *</label>
              <input
                type="number"
                id="area"
                name="area"
                value={formData.area}
                onChange={handleInputChange}
                className={errors.area ? 'error' : ''}
                placeholder="e.g., 120"
                min="1"
                step="0.1"
              />
              {errors.area && <span className="error-text">{errors.area}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="number">Apartment Number *</label>
              <input
                type="text"
                id="number"
                name="number"
                value={formData.number}
                onChange={handleInputChange}
                className={errors.number ? 'error' : ''}
                placeholder="e.g., A-101"
              />
              {errors.number && <span className="error-text">{errors.number}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="bedrooms">Bedrooms *</label>
              <input
                type="number"
                id="bedrooms"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleInputChange}
                className={errors.bedrooms ? 'error' : ''}
                placeholder="e.g., 1"
                min="0"
              />
              {errors.bedrooms && <span className="error-text">{errors.bedrooms}</span>}
              <small className="form-help">Number of bedrooms in the apartment complex</small>
            </div>

            <div className="form-group">
              <label htmlFor="totalParts">Total Studios/Parts *</label>
              <input
                type="number"
                id="totalParts"
                name="totalParts"
                value={formData.totalParts}
                onChange={handleInputChange}
                className={errors.totalParts ? 'error' : ''}
                placeholder="e.g., 4"
                min="1"
              />
              {errors.totalParts && <span className="error-text">{errors.totalParts}</span>}
              <small className="form-help">How many studio units in this apartment</small>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="bathrooms">Bathroom Type *</label>
              <select
                id="bathrooms"
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleInputChange}
                className={errors.bathrooms ? 'error' : ''}
              >
                <option value="private">Private</option>
                <option value="shared">Shared</option>
              </select>
              {errors.bathrooms && <span className="error-text">{errors.bathrooms}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="floor">Floor *</label>
            <input
              type="text"
              id="floor"
              name="floor"
              value={formData.floor}
              onChange={handleInputChange}
              className={errors.floor ? 'error' : ''}
              placeholder="e.g., Ground Floor, 1st Floor, 2nd Floor"
            />
            {errors.floor && <span className="error-text">{errors.floor}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="photos">Apartment Photos *</label>
            <div className="photo-upload-container">
              <input
                type="file"
                id="photos"
                name="photos"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
                className="photo-upload-input"
              />
              <label htmlFor="photos" className="photo-upload-label">
                <div className="upload-icon">🏢</div>
                <div className="upload-text">
                  <strong>Click to upload apartment photos (optional)</strong>
                  <span>or drag and drop</span>
                </div>
                <div className="upload-hint">PNG, JPG, GIF up to 10MB each</div>
              </label>
            </div>
            {errors.photos && <span className="error-text">{errors.photos}</span>}
            
            {formData.photos.length > 0 && (
              <div className="photo-preview-grid">
                {formData.photos.map((photo, index) => (
                  <div key={index} className="photo-preview-item">
                    <img 
                      src={photo.preview} 
                      alt={`Apartment ${index + 1}`}
                      className="photo-preview-image"
                    />
                    <button
                      type="button"
                      className="photo-remove-btn"
                      onClick={() => removePhoto(index)}
                      title="Remove photo"
                    >
                      ×
                    </button>
                    <div className="photo-name">{photo.name}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="facilities">Facilities & Amenities</label>
            
            <div className="facility-input-section">
              <input
                type="text"
                value={facilityInput}
                onChange={(e) => setFacilityInput(e.target.value)}
                onKeyPress={handleFacilityInputKeyPress}
                placeholder="Type a facility and press Enter"
                className="facility-input"
              />
              <button 
                type="button" 
                onClick={() => addFacility(facilityInput)}
                className="add-facility-btn"
              >
                Add
              </button>
            </div>

            <div className="common-facilities">
              <p>Common facilities:</p>
              <div className="facility-suggestions">
                {commonFacilities.map(facility => (
                  <button
                    key={facility}
                    type="button"
                    className="facility-suggestion"
                    onClick={() => addFacility(facility)}
                    disabled={formData.facilities.includes(facility)}
                  >
                    {facility}
                  </button>
                ))}
              </div>
            </div>

            <div className="selected-facilities">
              {formData.facilities.map(facility => (
                <div key={facility} className="selected-facility">
                  <span>{facility}</span>
                  <button
                    type="button"
                    onClick={() => removeFacility(facility)}
                    className="remove-facility"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Adding Apartment...' : 'Add Apartment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddApartmentModal;