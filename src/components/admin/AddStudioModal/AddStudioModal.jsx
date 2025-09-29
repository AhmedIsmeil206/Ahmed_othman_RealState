import React, { useState } from 'react';
import { apartmentPartsApi, handleApiError, dataTransformers } from '../../../services/api';
import { convertToApiEnum, getValidOptions } from '../../../utils/apiEnums';
import LoadingSpinner from '../../common/LoadingSpinner/LoadingSpinner';
import './AddStudioModal.css';

const AddStudioModal = ({ isOpen, apartmentId, onStudioAdded, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    area: '',
    monthly_price: '',
    bedrooms: 1,
    bathrooms: 'private',
    furnished: 'yes',
    balcony: 'no',
    description: '',
    photos_url: []
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);

  // Don't render if modal is not open or no apartment ID provided
  if (!isOpen || !apartmentId) return null;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    setIsUploadingPhotos(true);
    
    try {
      // In a real implementation, you would upload to your file storage service
      // For now, we'll create object URLs for preview
      const photoUrls = files.map(file => URL.createObjectURL(file));
      
      setFormData(prev => ({
        ...prev,
        photos_url: [...prev.photos_url, ...photoUrls]
      }));

      // Clear error when user uploads photos
      if (errors.photos_url) {
        setErrors(prev => ({
          ...prev,
          photos_url: ''
        }));
      }
    } catch (error) {
      console.error('Error uploading photos:', error);
      setErrors(prev => ({
        ...prev,
        photos_url: 'Error uploading photos. Please try again.'
      }));
    } finally {
      setIsUploadingPhotos(false);
    }
  };

  const removePhoto = (index) => {
    setFormData(prev => ({
      ...prev,
      photos_url: prev.photos_url.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Studio title is required';
    }

    if (!formData.area.trim()) {
      newErrors.area = 'Area is required';
    }

    if (!formData.monthly_price.trim()) {
      newErrors.monthly_price = 'Monthly price is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
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
      console.log('🏗️ Creating studio for apartment ID:', apartmentId);
      console.log('📝 Form data:', formData);
      
      // Transform the data according to API requirements
      const apiData = dataTransformers.transformStudioToApi(formData);
      console.log('🔄 Transformed API data:', apiData);
      
      // Use the correct API endpoint: POST /apartments/rent/{apartment_id}/parts
      const createdStudio = await apartmentPartsApi.create(apartmentId, apiData);
      console.log('✅ Studio created successfully:', createdStudio);
      
      // Notify parent component
      if (onStudioAdded) {
        onStudioAdded(createdStudio);
      }
      
      // Close modal and reset form
      onClose();
      setFormData({
        title: '',
        area: '',
        monthly_price: '',
        bedrooms: 1,
        bathrooms: 'private',
        furnished: 'yes',
        balcony: 'no',
        description: '',
        photos_url: []
      });
      setErrors({});
      
    } catch (error) {
      console.error('❌ Error creating studio:', error);
      const errorMessage = handleApiError(error, 'Failed to create studio');
      setErrors({ general: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="add-studio-modal">
        <div className="modal-header">
          <h2>Add New Studio</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form className="studio-form" onSubmit={handleSubmit}>
          {errors.general && (
            <div className="error-message general-error">
              {errors.general}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="title">Studio Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={errors.title ? 'error' : ''}
              placeholder="Modern Studio - Unit A-201"
            />
            {errors.title && <span className="error-text">{errors.title}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="area">Area (sqm) *</label>
              <input
                type="text"
                id="area"
                name="area"
                value={formData.area}
                onChange={handleInputChange}
                className={errors.area ? 'error' : ''}
                placeholder="45.5"
              />
              {errors.area && <span className="error-text">{errors.area}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="monthly_price">Monthly Price (EGP) *</label>
              <input
                type="text"
                id="monthly_price"
                name="monthly_price"
                value={formData.monthly_price}
                onChange={handleInputChange}
                className={errors.monthly_price ? 'error' : ''}
                placeholder="3500.00"
              />
              {errors.monthly_price && <span className="error-text">{errors.monthly_price}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="bedrooms">Bedrooms</label>
              <input
                type="number"
                id="bedrooms"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleInputChange}
                min="1"
                placeholder="1"
              />
            </div>

            <div className="form-group">
              <label htmlFor="bathrooms">Bathrooms</label>
              <select
                id="bathrooms"
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleInputChange}
              >
                {getValidOptions.bathroomTypes().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="furnished">Furnished</label>
              <select
                id="furnished"
                name="furnished"
                value={formData.furnished}
                onChange={handleInputChange}
              >
                {getValidOptions.furnishedStatus().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="balcony">Balcony</label>
              <select
                id="balcony"
                name="balcony"
                value={formData.balcony}
                onChange={handleInputChange}
              >
                {getValidOptions.balconyTypes().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group full-width">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className={errors.description ? 'error' : ''}
              placeholder="Cozy studio apartment with modern amenities..."
              rows="4"
            />
            {errors.description && <span className="error-text">{errors.description}</span>}
          </div>

          <div className="form-group full-width">
            <label htmlFor="photos">Studio Photos</label>
            <div className="photo-upload-container">
              <input
                type="file"
                id="photos"
                name="photos"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
                className="photo-upload-input"
                disabled={isUploadingPhotos}
              />
              <label htmlFor="photos" className={`photo-upload-label ${isUploadingPhotos ? 'uploading' : ''}`}>
                {isUploadingPhotos ? (
                  <div className="upload-loading">
                    <LoadingSpinner size="small" color="primary" inline />
                  </div>
                ) : (
                  <>
                    <div className="upload-icon">📸</div>
                    <div className="upload-text">
                      <strong>Click to upload photos</strong>
                      <span>or drag and drop</span>
                    </div>
                    <div className="upload-hint">PNG, JPG, GIF up to 10MB each</div>
                  </>
                )}
              </label>
            </div>
            {errors.photos_url && <span className="error-text">{errors.photos_url}</span>}
            
            {formData.photos_url.length > 0 && (
              <div className="photo-preview-grid">
                {formData.photos_url.map((photoUrl, index) => (
                  <div key={index} className="photo-preview-item">
                    <img 
                      src={photoUrl} 
                      alt={`Studio ${index + 1}`}
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
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={isSubmitting || isUploadingPhotos}>
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="small" color="white" inline />
                  Adding Studio...
                </>
              ) : (
                'Add Studio'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStudioModal;