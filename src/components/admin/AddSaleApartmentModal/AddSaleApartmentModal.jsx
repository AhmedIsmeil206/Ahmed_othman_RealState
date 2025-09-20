import React, { useState } from 'react';
import { useMasterAuth, useProperty } from '../../../hooks/useRedux';
import './AddSaleApartmentModal.css';
import heroImg from '../../../assets/images/backgrounds/LP.jpg';
import useUniqueId from '../../../hooks/useUniqueId';

const AddSaleApartmentModal = ({ isOpen, onApartmentAdded, onClose }) => {
  const { currentUser } = useMasterAuth();
  const { createSaleApartment } = useProperty();
  const { generateApartmentId } = useUniqueId();
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    address: '',
    description: '',
    price: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    apartmentNumber: '',
    floor: '',
    mapUrl: '',
    facilities: [],
    contactNumber: '',
    photos: []
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
    'Children\'s Area', 'Community Center', 'Valet Parking',
    'Balcony', 'Central AC', 'Built-in Kitchen', 'Master Bedroom',
    'Walk-in Closet', 'Elevator', 'Laundry Room', 'Storage Room'
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
    
    console.log('Validating form with data:', formData);

    if (!formData.name.trim()) {
      newErrors.name = 'Apartment name is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.price.trim()) {
      newErrors.price = 'Price is required';
    } else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = 'Please enter a valid price';
    }

    if (!formData.bedrooms.trim()) {
      newErrors.bedrooms = 'Number of bedrooms is required';
    } else if (isNaN(Number(formData.bedrooms)) || Number(formData.bedrooms) <= 0) {
      newErrors.bedrooms = 'Please enter a valid number of bedrooms';
    }

    if (!formData.bathrooms.trim()) {
      newErrors.bathrooms = 'Number of bathrooms is required';
    } else if (isNaN(Number(formData.bathrooms)) || Number(formData.bathrooms) <= 0) {
      newErrors.bathrooms = 'Please enter a valid number of bathrooms';
    }

    if (!formData.area.trim()) {
      newErrors.area = 'Area is required';
    } else if (isNaN(Number(formData.area)) || Number(formData.area) <= 0) {
      newErrors.area = 'Please enter a valid area';
    }

    if (!formData.apartmentNumber.trim()) {
      newErrors.apartmentNumber = 'Apartment number is required';
    }

    if (!formData.floor.trim()) {
      newErrors.floor = 'Floor is required';
    }

    if (formData.photos.length === 0) {
      newErrors.photos = 'At least one photo is required for the apartment';
    }

    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required';
    } else if (!/^(\+201|01)[0-9]{9}$/.test(formData.contactNumber)) {
      newErrors.contactNumber = 'Please enter a valid Egyptian mobile number (e.g., +201012345678 or 01012345678)';
    }

    // Validate mapUrl if provided (optional field)
    if (formData.mapUrl.trim() && !isValidUrl(formData.mapUrl)) {
      newErrors.mapUrl = 'Please enter a valid URL (must start with http:// or https://)';
    }

    console.log('Validation errors found:', newErrors);
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
      const newSaleApartment = {
        id: generateApartmentId(),
        name: formData.name,
        location: formData.location,
        address: formData.address,
        description: formData.description,
        price: Number(formData.price),
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        area: Number(formData.area),
        apartmentNumber: formData.apartmentNumber, // Include apartment number
        floor: formData.floor,
        mapUrl: formData.mapUrl,
        facilities: formData.facilities,
        images: formData.photos.map(photo => photo.preview),
        image: formData.photos.length > 0 ? formData.photos[0].preview : heroImg,
        contactNumber: formData.contactNumber,
        listedAt: new Date().toISOString(),
        createdBy: currentUser?.email || 'Master Admin',
        isAvailable: true
      };


      
      // Use real API call to create sale apartment
      await createSaleApartment(newSaleApartment);
      
      // Notify parent component and close modal
      onApartmentAdded?.(newSaleApartment);
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        location: '',
        address: '',
        description: '',
        price: '',
        bedrooms: '',
        bathrooms: '',
        area: '',
        apartmentNumber: '',
        mapUrl: '',
        facilities: [],
        contactNumber: '',
        photos: []
      });
      
      setErrors({});
      console.log('Form reset completed');
      
    } catch (error) {
      console.error('Error adding sale apartment:', error);
      setErrors({ general: 'An error occurred while adding the apartment. Please try again.' });
    } finally {
      setIsSubmitting(false);
      console.log('Form submission completed');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="add-sale-apartment-modal">
        <div className="modal-header">
          <h2>Add New Apartment for Sale</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form className="sale-apartment-form" onSubmit={handleSubmit}>
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
              placeholder="e.g., Luxury 3BR Apartment in New Cairo"
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
                <option value="Maadi">Maadi</option>
                <option value="Mokkattam">Mokkattam</option>
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
                placeholder="e.g., 90th Street, Maadi"
              />
              {errors.address && <span className="error-text">{errors.address}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="area">Area (sq ft) *</label>
              <input
                type="number"
                id="area"
                name="area"
                value={formData.area}
                onChange={handleInputChange}
                className={errors.area ? 'error' : ''}
                placeholder="e.g., 1500"
                min="1"
              />
              {errors.area && <span className="error-text">{errors.area}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="apartmentNumber">Apartment Number *</label>
              <input
                type="text"
                id="apartmentNumber"
                name="apartmentNumber"
                value={formData.apartmentNumber}
                onChange={handleInputChange}
                className={errors.apartmentNumber ? 'error' : ''}
                placeholder="e.g., A-301"
              />
              {errors.apartmentNumber && <span className="error-text">{errors.apartmentNumber}</span>}
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
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price">Price (EGP) *</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className={errors.price ? 'error' : ''}
                placeholder="e.g., 2500000"
                min="1"
              />
              {errors.price && <span className="error-text">{errors.price}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="bedrooms">Bedrooms *</label>
              <input
                type="number"
                id="bedrooms"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleInputChange}
                className={errors.bedrooms ? 'error' : ''}
                placeholder="e.g., 3"
                min="1"
              />
              {errors.bedrooms && <span className="error-text">{errors.bedrooms}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="bathrooms">Bathrooms *</label>
              <input
                type="number"
                id="bathrooms"
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleInputChange}
                className={errors.bathrooms ? 'error' : ''}
                placeholder="e.g., 2"
                min="1"
                step="0.5"
              />
              {errors.bathrooms && <span className="error-text">{errors.bathrooms}</span>}
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
              placeholder="Describe the apartment, its features, and unique selling points..."
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

          <div className="form-group">
            <label htmlFor="contactNumber">Contact Number *</label>
            <input
              type="tel"
              id="contactNumber"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleInputChange}
              className={errors.contactNumber ? 'error' : ''}
              placeholder="e.g., +201012345678 or 01012345678"
            />
            {errors.contactNumber && <span className="error-text">{errors.contactNumber}</span>}
            <div className="contact-hint">
              This number will be used for WhatsApp contact button for inquiries about this apartment.
            </div>
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
                <div className="upload-icon">🏠</div>
                <div className="upload-text">
                  <strong>Click to upload apartment photos</strong>
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
            <button 
              type="submit" 
              className="submit-btn" 
              disabled={isSubmitting}
              onClick={(e) => {
                console.log('Submit button clicked!');
                console.log('Event details:', e);
                
                // If form submission doesn't work, try calling handler directly
                const form = e.target.closest('form');
                if (form) {
                  console.log('Form found, submitting...');
                  form.requestSubmit();
                } else {
                  console.log('No form found, calling handleSubmit directly');
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            >
              {isSubmitting ? 'Adding Apartment...' : 'Add Apartment for Sale'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSaleApartmentModal;