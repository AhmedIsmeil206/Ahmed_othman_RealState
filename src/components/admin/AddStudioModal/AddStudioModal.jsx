import React, { useState } from 'react';
import { useProperty, useAdminAuth } from '../../../hooks/useRedux';
import useUniqueId from '../../../hooks/useUniqueId';
import LoadingSpinner from '../../common/LoadingSpinner/LoadingSpinner';
import './AddStudioModal.css';

const AddStudioModal = ({ isOpen, apartmentId, onStudioAdded, onClose }) => {
  const { getApartmentById, getApartmentsByCreator, createStudio } = useProperty();
  const { currentAdmin } = useAdminAuth();
  const { generateStudioId } = useUniqueId();
  
  // Get apartments created by current admin only
  const adminApartments = currentAdmin ? 
    getApartmentsByCreator(currentAdmin.email || currentAdmin.accountOrMobile) : 
    [];
  
  const [formData, setFormData] = useState({
    selectedApartmentId: apartmentId || '',
    title: '',
    area: '',
    unitNumber: '',
    price: '',
    pricePerMonth: '',
    bedrooms: '',
    bathrooms: '1',
    furnished: 'Yes',
    description: '',
    balcony: 'Yes',
    parking: 'Available', 
    isAvailable: true,
    photos: []
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);

  // Don't render if modal is not open
  if (!isOpen) return null;

  // Get the selected apartment
  const selectedApartment = getApartmentById(formData.selectedApartmentId);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Update pricePerMonth when price changes
    if (name === 'price') {
      const numericPrice = value.replace(/[^0-9]/g, '');
      setFormData(prev => ({
        ...prev,
        price: value,
        pricePerMonth: parseInt(numericPrice) || 0
      }));
    }

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
      // Simulate network delay for photo processing
      await new Promise(resolve => setTimeout(resolve, 500));
      
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

      const results = await Promise.all(fileReaders);
      
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, ...results]
      }));

      // Clear error when user uploads photos
      if (errors.photos) {
        setErrors(prev => ({
          ...prev,
          photos: ''
        }));
      }
    } catch (error) {
      console.error('Error uploading photos:', error);
      setErrors(prev => ({
        ...prev,
        photos: 'Error uploading photos. Please try again.'
      }));
    } finally {
      setIsUploadingPhotos(false);
    }
  };

  const removePhoto = (index) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Only validate apartment selection if no apartmentId was provided
    if (!apartmentId && !formData.selectedApartmentId) {
      newErrors.selectedApartmentId = 'Please select an apartment';
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Studio title is required';
    }

    if (!formData.area.trim()) {
      newErrors.area = 'Area is required';
    }

    if (!formData.unitNumber.trim()) {
      newErrors.unitNumber = 'Unit number is required';
    }

    if (!formData.price.trim()) {
      newErrors.price = 'Price is required';
    } else if (formData.pricePerMonth < 1000) {
      newErrors.price = 'Price must be at least 1000 EGP';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.photos.length === 0) {
      newErrors.photos = 'At least one photo is required';
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
      // Create new studio object
      const newStudio = {
        id: generateStudioId(), // Use unique ID generation
        apartmentId: formData.selectedApartmentId,
        title: formData.title,
        price: formData.price.startsWith('EGP') ? formData.price : `EGP ${formData.price.replace(/[^0-9,]/g, '')}`,
        pricePerMonth: formData.pricePerMonth,
        location: selectedApartment.location,
        area: formData.area + (formData.area.includes('sqm') ? '' : ' sqm'),
        bedrooms: formData.bedrooms,
        bathrooms: parseInt(formData.bathrooms),
        furnished: formData.furnished,
        type: "Studio",
        ownership: "Rent",
        completionStatus: "Ready",
        unitNumber: formData.unitNumber,
        description: formData.description,
        createdBy: currentAdmin?.id || currentAdmin?.email || 'admin_123',
        createdAt: new Date().toISOString(),
        highlights: {
          type: "Studio",
          ownership: "Rent",
          area: formData.area,
          bedrooms: formData.bedrooms,
          bathrooms: formData.bathrooms,
          furnished: formData.furnished
        },
        details: {
          paymentOption: "Monthly",
          completionStatus: "Ready",
          furnished: formData.furnished,
          parking: formData.parking,
          balcony: formData.balcony
        },
        images: formData.photos.length > 0 ? formData.photos.map(photo => photo.preview) : [
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
          "https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
        ],
        coordinates: selectedApartment?.coordinates || { lat: 30.0444, lng: 31.2357 },
        postedDate: "Just now",
        contactNumber: selectedApartment?.contactNumber || "+20 100 123 4567",
        isAvailable: formData.isAvailable,
        amenities: [
          "Air Conditioning",
          "Built-in Wardrobe", 
          "Kitchen Appliances",
          "Private Bathroom",
          formData.parking !== "Not Available" ? "Parking Space" : null,
          formData.balcony === "Yes" ? "Balcony" : null,
          "High-Speed Internet",
          "24/7 Security",
          "Elevator Access"
        ].filter(Boolean),
        // Inherit location from parent apartment  
        locationUrl: selectedApartment?.mapUrl
      };

      // Use real API call to create studio
      await createStudio(formData.selectedApartmentId, newStudio);
      
      // Notify parent and close modal
      onStudioAdded?.(newStudio);
      onClose();
      
      // Reset form
      setFormData({
        selectedApartmentId: apartmentId || '',
        title: '',
        area: '',
        unitNumber: '',
        price: '',
        pricePerMonth: '',
        bedrooms: '',
        bathrooms: '1',
        furnished: 'Yes',
        description: '',
        balcony: 'Yes',
        parking: 'Available', 
        isAvailable: true,
        photos: []
      });
      setErrors({});
    } catch (error) {
      console.error('Error adding studio:', error);
      setErrors({ general: 'An error occurred while adding the studio. Please try again.' });
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

          {/* Only show apartment selection if no apartmentId was provided */}
          {!apartmentId && (
            <div className="form-group">
              <label htmlFor="selectedApartmentId">Select Apartment *</label>
              <select
                id="selectedApartmentId"
                name="selectedApartmentId"
                value={formData.selectedApartmentId}
                onChange={handleInputChange}
                className={errors.selectedApartmentId ? 'error' : ''}
              >
                <option value="">Choose an apartment...</option>
                {adminApartments.map(apartment => (
                  <option key={apartment.id} value={apartment.id}>
                    {apartment.name} - {apartment.location}
                  </option>
                ))}
              </select>
              {errors.selectedApartmentId && <span className="error-text">{errors.selectedApartmentId}</span>}
            </div>
          )}

          {/* Show selected apartment info when apartmentId is provided */}
          {apartmentId && selectedApartment && (
            <div className="form-group">
              <label>Adding Studio to:</label>
              <div className="apartment-info">
                <strong>{selectedApartment.name}</strong>
                <p>{selectedApartment.location}</p>
              </div>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title">Studio Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={errors.title ? 'error' : ''}
                placeholder="Modern Studio in Downtown - Unit 201"
              />
              {errors.title && <span className="error-text">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="unitNumber">Unit Number *</label>
              <input
                type="text"
                id="unitNumber"
                name="unitNumber"
                value={formData.unitNumber}
                onChange={handleInputChange}
                className={errors.unitNumber ? 'error' : ''}
                placeholder="A-201"
              />
              {errors.unitNumber && <span className="error-text">{errors.unitNumber}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="area">Area *</label>
              <input
                type="text"
                id="area"
                name="area"
                value={formData.area}
                onChange={handleInputChange}
                className={errors.area ? 'error' : ''}
                placeholder="45 sqm"
              />
              {errors.area && <span className="error-text">{errors.area}</span>}
            </div>


          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price">Monthly Price (EGP) *</label>
              <input
                type="text"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className={errors.price ? 'error' : ''}
                placeholder="12,000"
              />
              {errors.price && <span className="error-text">{errors.price}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="bedrooms">Bedrooms</label>
              <input
                type="text"
                id="bedrooms"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleInputChange}
                placeholder="Studio"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="bathrooms">Bathrooms</label>
              <select
                id="bathrooms"
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleInputChange}
              >
                <option value="1">1</option>
                <option value="2">2</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="furnished">Furnished</label>
              <select
                id="furnished"
                name="furnished"
                value={formData.furnished}
                onChange={handleInputChange}
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Semi-furnished">Semi-furnished</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="balcony">Balcony</label>
              <select
                id="balcony"
                name="balcony"
                value={formData.balcony}
                onChange={handleInputChange}
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="parking">Parking</label>
              <select
                id="parking"
                name="parking"
                value={formData.parking}
                onChange={handleInputChange}
              >
                <option value="Available">Available</option>
                <option value="Valet">Valet</option>
                <option value="Not Available">Not Available</option>
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
              placeholder="Cozy studio apartment with modern amenities. Features include air conditioning, built-in wardrobe, kitchen with appliances, and private bathroom. Located in a quiet neighborhood with easy access to public transportation and shopping centers."
              rows="4"
            />
            {errors.description && <span className="error-text">{errors.description}</span>}
          </div>

          <div className="form-group full-width">
            <label htmlFor="photos">Studio Photos *</label>
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
                    <div className="upload-text">
                      <strong>Uploading photos...</strong>
                      <span>Please wait</span>
                    </div>
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
            {errors.photos && <span className="error-text">{errors.photos}</span>}
            
            {formData.photos.length > 0 && (
              <div className="photo-preview-grid">
                {formData.photos.map((photo, index) => (
                  <div key={index} className="photo-preview-item">
                    <img 
                      src={photo.preview} 
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
                    <div className="photo-name">{photo.name}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isAvailable"
                checked={formData.isAvailable}
                onChange={handleInputChange}
              />
              <span className="checkbox-text">Studio is available for rent</span>
            </label>
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